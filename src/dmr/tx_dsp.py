"""
Server-side DSP processing for DMR TX (Microphone -> DMR Network).

Processes 16-bit PCM @ 8000 Hz in 60ms bursts (480 samples = 960 bytes)
immediately before passing audio to the AMBE vocoder encoder.

Blocks included:
1. HPF (High-Pass Filter): 300 Hz low-cut filter to eliminate microphone breath pops and low-frequency rumble.
2. Presence Boost: Peaking EQ @ 2200 Hz (Q=1.2, 0..+6 dB) for enhanced speech intelligibility.
3. Digital Mic Gain: 0..+12 dB calibrated pre-amplification.
4. TX DSP AGC: Classical amateur radio DSP compressor with fast attack (60ms), syllabic release (600ms),
   and pause hang-time (350ms) to freeze gain during inter-word silence (preventing noise pump-up).
5. Soft-clipping limiter (tanh) for transparent headroom protection before AMBE encoding.
"""

import math
import struct
import logging
from typing import Optional

from dmr.audio_equalizer import BiquadFilter, FS, SOFT_CLIP_THRESHOLD, INT16_MAX, INT16_MIN
from dmr.audio_agc import ServerAudioAgc

logger = logging.getLogger(__name__)


TX_SOFT_KNEE = 24576.0
TX_SOFT_HEADROOM = 8191.0


class ServerTxDsp:
    """Complete server-side DSP chain for microphone audio."""

    def __init__(self):
        # Settings (neutral flat response by default to preserve natural voice spectrum)
        self.hpf_enabled: bool = True
        self.presence_boost: float = 0.0  # dB (0..+8 dB, 2400 Hz Peaking)
        self.eq_low: float = 0.0          # dB (-15..+12 dB, 240 Hz Low-shelf)
        self.eq_mid: float = 0.0          # dB (-12..+12 dB, 1100 Hz Peaking)
        self.eq_high: float = 0.0         # dB (-10..+10 dB, 3200 Hz High-shelf)
        self.mic_gain_db: float = 0.0     # dB (0..+12 dB)
        self.dsp_agc_enabled: bool = False

        # Internal multipliers
        self._linear_gain: float = 1.0

        # DSP Filter nodes
        self.hpf_filter = BiquadFilter()
        self.low_filter = BiquadFilter()
        self.mid_filter = BiquadFilter()
        self.presence_filter = BiquadFilter()
        self.high_filter = BiquadFilter()

        # Dedicated Server AGC instance for microphone audio
        self.agc = ServerAudioAgc()
        self.agc.enabled = False
        self.agc.set_profile("standard")

        self._update_dsp_nodes()

    def _update_dsp_nodes(self) -> None:
        """Update biquad filter coefficients and linear gains."""
        if self.hpf_enabled:
            # 160 Hz gentle Butterworth low-cut: removes breath pops & <150 Hz rumble
            # while keeping natural chest voice fundamentals (160-300 Hz) intact
            self.hpf_filter.setup_highpass(160.0, 0.7071, FS)
        else:
            self.hpf_filter.active = False

        if abs(self.eq_low) > 0.05:
            self.low_filter.setup_lowshelf(240.0, self.eq_low, FS)
        else:
            self.low_filter.active = False

        if abs(self.eq_mid) > 0.05:
            self.mid_filter.setup_peaking(1100.0, 1.0, self.eq_mid, FS)
        else:
            self.mid_filter.active = False

        if abs(self.presence_boost) > 0.05:
            self.presence_filter.setup_peaking(2400.0, 1.2, self.presence_boost, FS)
        else:
            self.presence_filter.active = False

        if abs(self.eq_high) > 0.05:
            self.high_filter.setup_highshelf(3200.0, self.eq_high, FS)
        else:
            self.high_filter.active = False

        self._linear_gain = 10.0 ** (self.mic_gain_db / 20.0)
        self.agc.enabled = self.dsp_agc_enabled

    def set_settings(
        self,
        hpf_enabled: Optional[bool] = None,
        presence_boost: Optional[float] = None,
        eq_low: Optional[float] = None,
        eq_mid: Optional[float] = None,
        eq_high: Optional[float] = None,
        mic_gain: Optional[float] = None,
        dsp_agc: Optional[bool] = None,
        agc_profile: Optional[str] = None,
    ) -> None:
        """Update TX DSP parameters on the fly."""
        changed = False
        if hpf_enabled is not None:
            val = bool(hpf_enabled)
            if val != self.hpf_enabled:
                self.hpf_enabled = val
                changed = True
        if eq_low is not None:
            val = max(-15.0, min(12.0, float(eq_low)))
            if abs(val - self.eq_low) > 0.05:
                self.eq_low = val
                changed = True
        if eq_mid is not None:
            val = max(-12.0, min(12.0, float(eq_mid)))
            if abs(val - self.eq_mid) > 0.05:
                self.eq_mid = val
                changed = True
        if presence_boost is not None:
            val = max(0.0, min(8.0, float(presence_boost)))
            if abs(val - self.presence_boost) > 0.05:
                self.presence_boost = val
                changed = True
        if eq_high is not None:
            val = max(-10.0, min(10.0, float(eq_high)))
            if abs(val - self.eq_high) > 0.05:
                self.eq_high = val
                changed = True
        if mic_gain is not None:
            val = max(0.0, min(12.0, float(mic_gain)))
            if abs(val - self.mic_gain_db) > 0.05:
                self.mic_gain_db = val
                changed = True
        if dsp_agc is not None:
            val = bool(dsp_agc)
            if val != self.dsp_agc_enabled:
                self.dsp_agc_enabled = val
                changed = True
        if agc_profile is not None and agc_profile:
            self.agc.set_profile(str(agc_profile))

        if changed:
            self._update_dsp_nodes()

    def reset(self) -> None:
        """Reset internal filter states and AGC when starting or ending transmission."""
        self.hpf_filter.reset()
        self.low_filter.reset()
        self.mid_filter.reset()
        self.presence_filter.reset()
        self.high_filter.reset()
        self.agc.reset_slot(1)

    def get_settings(self) -> dict:
        """Return current TX DSP settings."""
        return {
            "hpf_enabled": self.hpf_enabled,
            "presence_boost": self.presence_boost,
            "eq_low": self.eq_low,
            "eq_mid": self.eq_mid,
            "eq_high": self.eq_high,
            "mic_gain": self.mic_gain_db,
            "dsp_agc": self.dsp_agc_enabled,
            "agc_profile": self.agc.profile,
        }

    def process_burst(self, pcm_bytes: bytes) -> bytes:
        """
        Process a PCM burst (16-bit signed LE, 8000 Hz).

        Chain:
        HPF 160 Hz -> Low-shelf 240 Hz -> Mid Peaking 1100 Hz -> Presence 2400 Hz
        -> High-shelf 3200 Hz -> Mic Gain -> C1 Soft Limiter -> TX DSP AGC
        """
        num_samples = len(pcm_bytes) // 2
        if num_samples == 0:
            return pcm_bytes

        # If all DSP features are disabled, pass through directly
        if (
            not self.hpf_enabled
            and not self.low_filter.active
            and not self.mid_filter.active
            and not self.presence_filter.active
            and not self.high_filter.active
            and abs(self.mic_gain_db) < 0.05
            and not self.dsp_agc_enabled
        ):
            return pcm_bytes

        samples = list(struct.unpack(f"<{num_samples}h", pcm_bytes))

        hpf = self.hpf_filter
        low = self.low_filter
        mid = self.mid_filter
        pres = self.presence_filter
        high = self.high_filter
        gain = self._linear_gain
        apply_gain = abs(gain - 1.0) > 0.005

        for i in range(num_samples):
            s = float(samples[i])

            # 1. High-Pass Filter (160 Hz)
            if hpf.active:
                s = hpf.process_sample(s)

            # 2. Low-shelf 240 Hz
            if low.active:
                s = low.process_sample(s)

            # 3. Mid Peaking 1100 Hz
            if mid.active:
                s = mid.process_sample(s)

            # 4. Presence Peaking 2400 Hz
            if pres.active:
                s = pres.process_sample(s)

            # 5. High-shelf 3200 Hz
            if high.active:
                s = high.process_sample(s)

            # 6. Digital Mic Gain
            if apply_gain:
                s *= gain

            # 7. C1-continuous Soft Limiter (smooth tanh knee starting at 24576)
            if s > TX_SOFT_KNEE:
                over = s - TX_SOFT_KNEE
                s = TX_SOFT_KNEE + TX_SOFT_HEADROOM * math.tanh(over / TX_SOFT_HEADROOM)
            elif s < -TX_SOFT_KNEE:
                over = s + TX_SOFT_KNEE
                s = -TX_SOFT_KNEE + TX_SOFT_HEADROOM * math.tanh(over / TX_SOFT_HEADROOM)

            if s > INT16_MAX:
                s = INT16_MAX
            elif s < INT16_MIN:
                s = INT16_MIN

            samples[i] = int(s)

        out_pcm = struct.pack(f"<{num_samples}h", *samples)

        # 8. TX AGC (automatic leveling with pause freeze)
        if self.dsp_agc_enabled:
            out_pcm = self.agc.process_burst(out_pcm, slot=1)

        return out_pcm
