/**
 * ProxDMR AMBE+2 Vocoder Modal & Synthesis Tuning Controls (mbelib-neo)
 */

export function setupDsdfmeModal() {
  const ambeModal = document.getElementById("ambeModal");
  if (!ambeModal) return;

  const closeBtn = document.getElementById("closeAmbeBtn");
  const bottomSaveBtn = document.getElementById("btnCloseAmbeBottom");
  const resetBtn = document.getElementById("btnResetAmbeDefaults");

  const chkSpectralEnh = document.getElementById("chkAmbeSpectralEnh");
  const badgeSpectralEnh = document.getElementById("badgeAmbeSpectralEnh");
  const sliderHighBandGain = document.getElementById("sliderAmbeHighBandGain");
  const valHighBandGain = document.getElementById("valAmbeHighBandGain");
  const sliderUnvoicedGain = document.getElementById("sliderAmbeUnvoicedGain");
  const valUnvoicedGain = document.getElementById("valAmbeUnvoicedGain");

  const ambePresetButtons = document.querySelectorAll(".btn-ambe-preset");
  const saveAmbePresetBtn = document.getElementById("saveAmbePresetBtn");
  const saveAmbePresetText = document.getElementById("saveAmbePresetText");

  let activePresetId = localStorage.getItem("proxdmr_ambe_active_preset") || "1";

  const DEFAULT_AMBE_PRESETS = {
    "1": { spectral_enh: true, high_band_gain_db: 0.5, unvoiced_gain_db: -1.5 }, // Default / Balanced
    "2": { spectral_enh: true, high_band_gain_db: 4.5, unvoiced_gain_db: 1.0 },  // Bright / Punchy
    "3": { spectral_enh: true, high_band_gain_db: 0.0, unvoiced_gain_db: -1.5 }  // Soft Studio
  };

  function openModal() {
    ambeModal.classList.add("show");
    ambeModal.style.display = "flex";
  }

  function closeModal() {
    ambeModal.classList.remove("show");
    ambeModal.style.display = "none";
  }

  function formatDb(val) {
    const num = parseFloat(val) || 0.0;
    const isCyr = window.I18N && (window.I18N.currentLang === "ru" || window.I18N.currentLang === "uk");
    const u = isCyr ? "дБ" : "dB";
    return (num > 0 ? `+${num.toFixed(1)}` : num.toFixed(1)) + " " + u;
  }

  function updateControlsUI(cfg) {
    if (chkSpectralEnh) {
      chkSpectralEnh.checked = Boolean(cfg.spectral_enh);
      if (badgeSpectralEnh) {
        badgeSpectralEnh.textContent = cfg.spectral_enh
          ? (window.t ? window.t("common.on", {}, "Вкл") : "Вкл")
          : (window.t ? window.t("audio.limit_off", {}, "Выкл") : "Выкл");
        badgeSpectralEnh.style.background = cfg.spectral_enh ? "#1f6feb" : "rgba(110, 118, 129, 0.4)";
      }
    }
    if (sliderHighBandGain) {
      sliderHighBandGain.value = cfg.high_band_gain_db;
      if (valHighBandGain) valHighBandGain.textContent = formatDb(cfg.high_band_gain_db);
    }
    if (sliderUnvoicedGain) {
      sliderUnvoicedGain.value = cfg.unvoiced_gain_db;
      if (valUnvoicedGain) valUnvoicedGain.textContent = formatDb(cfg.unvoiced_gain_db);
    }
  }

  function getCurrentControlsState() {
    return {
      spectral_enh: chkSpectralEnh ? chkSpectralEnh.checked : true,
      high_band_gain_db: sliderHighBandGain ? parseFloat(sliderHighBandGain.value) : 0.5,
      unvoiced_gain_db: sliderUnvoicedGain ? parseFloat(sliderUnvoicedGain.value) : -1.5
    };
  }

  let _syncTimer = null;
  function scheduleSyncSettings() {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      const state = getCurrentControlsState();
      if (window.ws && typeof window.ws.send === "function" && window.ws.readyState === WebSocket.OPEN) {
        window.ws.send(JSON.stringify({
          type: "set_vocoder_settings",
          spectral_enh: state.spectral_enh,
          high_band_gain_db: state.high_band_gain_db,
          unvoiced_gain_db: state.unvoiced_gain_db
        }));
      }
    }, 80);
  }

  function updatePresetButtonsUI() {
    ambePresetButtons.forEach(btn => {
      const pId = btn.getAttribute("data-ambe-preset");
      btn.classList.toggle("active", pId === activePresetId);
    });
    document.querySelectorAll(".btn-ambe-mini-preset .mini-preset-label").forEach(lbl => {
      lbl.textContent = `P${activePresetId}`;
    });
    document.querySelectorAll(".ambe-menu .mini-preset-item").forEach(item => {
      const pId = item.getAttribute("data-ambe-preset");
      item.classList.toggle("active", pId === activePresetId);
    });
    if (saveAmbePresetText) {
      saveAmbePresetText.textContent = window.t ? window.t("ambe.btn_save_text", { id: activePresetId }) : `Сохранить в P${activePresetId}`;
    }
    if (saveAmbePresetBtn) {
      saveAmbePresetBtn.title = window.t ? window.t("ambe.btn_save_title", { id: activePresetId }) : `Сохранить текущие параметры вокодера в пресет ${activePresetId}`;
    }
  }

  function applyAmbePreset(id) {
    activePresetId = id.toString();
    localStorage.setItem("proxdmr_ambe_active_preset", activePresetId);

    let cfg = null;
    const raw = localStorage.getItem(`proxdmr_ambe_preset_${activePresetId}`);
    if (raw) {
      try { cfg = JSON.parse(raw); } catch (e) {}
    }
    if (!cfg) {
      cfg = DEFAULT_AMBE_PRESETS[activePresetId] || DEFAULT_AMBE_PRESETS["1"];
    }

    updateControlsUI(cfg);
    updatePresetButtonsUI();
    scheduleSyncSettings();
  }
  window.applyAmbePreset = applyAmbePreset;

  function saveCurrentToPreset(id) {
    const state = getCurrentControlsState();
    localStorage.setItem(`proxdmr_ambe_preset_${id}`, JSON.stringify(state));
    applyAmbePreset(id);

    if (saveAmbePresetBtn) {
      saveAmbePresetBtn.classList.add("saved-flash");
      if (saveAmbePresetText) {
        saveAmbePresetText.textContent = window.t ? window.t("ambe.btn_saved_text", { id }) : `✓ Сохранено в P${id}`;
      }
      setTimeout(() => {
        saveAmbePresetBtn.classList.remove("saved-flash");
        if (saveAmbePresetText) {
          saveAmbePresetText.textContent = window.t ? window.t("ambe.btn_save_text", { id: activePresetId }) : `Сохранить в P${activePresetId}`;
        }
      }, 1400);
    }
  }

  // Open modal triggers
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".btn-ambe-trigger") || (e.target.id === "btnAmbeMain" ? e.target : null);
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      openModal();
      applyAmbePreset(activePresetId);
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (bottomSaveBtn) bottomSaveBtn.addEventListener("click", () => {
    saveCurrentToPreset(activePresetId);
    closeModal();
  });
  if (resetBtn) resetBtn.addEventListener("click", () => {
    const def = DEFAULT_AMBE_PRESETS[activePresetId] || DEFAULT_AMBE_PRESETS["1"];
    updateControlsUI(def);
    saveCurrentToPreset(activePresetId);
  });

  if (ambeModal) {
    ambeModal.addEventListener("click", (e) => {
      if (e.target === ambeModal) closeModal();
    });
  }

  // Controls input events
  if (chkSpectralEnh) {
    chkSpectralEnh.addEventListener("change", () => {
      if (badgeSpectralEnh) {
        badgeSpectralEnh.textContent = chkSpectralEnh.checked
          ? (window.t ? window.t("common.on", {}, "Вкл") : "Вкл")
          : (window.t ? window.t("audio.limit_off", {}, "Выкл") : "Выкл");
        badgeSpectralEnh.style.background = chkSpectralEnh.checked ? "#1f6feb" : "rgba(110, 118, 129, 0.4)";
      }
      scheduleSyncSettings();
    });
  }

  if (sliderHighBandGain) {
    sliderHighBandGain.addEventListener("input", () => {
      if (valHighBandGain) valHighBandGain.textContent = formatDb(sliderHighBandGain.value);
    });
    sliderHighBandGain.addEventListener("change", scheduleSyncSettings);
  }

  if (sliderUnvoicedGain) {
    sliderUnvoicedGain.addEventListener("input", () => {
      if (valUnvoicedGain) valUnvoicedGain.textContent = formatDb(sliderUnvoicedGain.value);
    });
    sliderUnvoicedGain.addEventListener("change", scheduleSyncSettings);
  }

  // Preset buttons
  ambePresetButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const pId = btn.getAttribute("data-ambe-preset");
      if (pId) applyAmbePreset(pId);
    });
  });

  if (saveAmbePresetBtn) {
    saveAmbePresetBtn.addEventListener("click", () => {
      saveCurrentToPreset(activePresetId);
    });
  }

  // Initial load
  applyAmbePreset(activePresetId);
}

if (typeof window !== "undefined") {
  window.setupDsdfmeModal = setupDsdfmeModal;
  window.__proxdmr = window.__proxdmr || {};
  window.__proxdmr.setupDsdfmeModal = setupDsdfmeModal;
}

export default { setupDsdfmeModal };
