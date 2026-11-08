<!-- lang:en -->
# ProxDMR v2.16 — Release Notes

* Replaced the vocoder/encoder core with the significantly higher-quality and more advanced mbelib-neo.
* Implemented a separate asynchronous receive pipeline module and a dedicated jitter buffer. BrandMeister network packet reception is completely isolated from decoding and web transmission, eliminating stuttering and audio dropouts caused by network fluctuations. Inter-frame transition smoothing has been added.
* Low-latency web engine based on AudioWorklet. Audio playback in the browser has been offloaded to a dedicated AudioWorklet. A 4-stage Chebyshev IIR filter has been implemented for sample rate interpolation (8 kHz → 48 kHz) with effective suppression of mirror frequencies without resource-intensive Fourier transforms. Automatic dynamic buffer adaptation to client network jitter.
* Complete separation of audio processing chains: independent 10-band graphic equalizers, AGC, and limiters for both digital and analog (ASL) modes.
* Optimization of the analog path (ASL): increased Asterisk resource limits and expansion of the IAX2 network jitter buffer.
* Fault tolerance for connections with BrandMeister. Automatic failover mechanism: if communication with the current BM master is lost for more than 1 minute, the system automatically switches to the next server from the lowest-latency table.
* Isolated mode for the built-in "Parrot" echo test. Server-side processing of digital and analog echo tests has been implemented, with temporary isolation of the client's WebSocket session from the general airwaves during self-voice calibration.

<!-- lang:ru -->
# ProxDMR v2.16 — Список изменений

* Заменено ядро вокодера/энкодера на значительно более качественную и продвинутую библиотеку mbelib-neo.
* Реализован отдельный асинхронный модуль конвейера приёма и выделенный джиттер-буфер. Приём сетевых пакетов BrandMeister полностью изолирован от декодирования и веб-передачи, что устраняет заикания и выпадения звука из-за сетевых флуктуаций. Добавлено сглаживание межфреймовых переходов.
* Низколатентный веб-движок на базе AudioWorklet. Воспроизведение звука в браузере переведено на выделенный AudioWorklet. Реализован 4-каскадный IIR-фильтр Чебышёва для интерполяции частоты дискретизации (8 кГц → 48 кГц) с эффективным подавлением зеркальных частот без ресурсоёмких преобразований Фурье. Автоматическая динамическая адаптация буфера под реальный сетевой джиттер клиента.
* Полное разделение цепочек обработки звука: независимые 10-полосные графические эквалайзеры, АРУ и лимитеры как для цифрового (DMR), так и для аналогового (ASL) режимов.
* Оптимизация аналогового тракта (ASL): увеличены лимиты вычислительных ресурсов для Asterisk и расширен сетевой джиттер-буфер IAX2.
* Отказоустойчивость соединения с BrandMeister: автоматический механизм отказоустойчивости (failover) — при потере связи с текущим мастером BM более чем на 1 минуту система автоматически переключается на следующий сервер из таблицы наименьших задержек.
* Изолированный режим встроенного эхо-теста («Попугай»). Реализована серверная обработка цифрового и аналогового эхо-теста с временной изоляцией WebSocket-сессии клиента от общего радиоэфира на время калибровки собственного голоса.

<!-- lang:uk -->
# ProxDMR v2.16 — Список змін

* Замінено ядро вокодера/енкодера на значно якіснішу та передовішу бібліотеку mbelib-neo.
* Реалізовано окремий асинхронний модуль конвеєра прийому та виділений джитер-буфер. Прийом мережевих пакетів BrandMeister повністю ізольовано від декодування та веб-передачі, що усуває заїкання та випадання звуку через мережеві флуктуації. Додано згладжування міжфреймових переходів.
* Низьколатентний веб-рушій на базі AudioWorklet. Відтворення звуку в браузері переведено на виділений AudioWorklet. Реалізовано 4-каскадний IIR-фільтр Чебишова для інтерполяції частоти дискретизації (8 кГц → 48 кГц) з ефективним придушенням дзеркальних частот без ресурсомістких перетворень Фур'є. Автоматична динамічна адаптація буфера під реальний мережевий джитер клієнта.
* Повне розділення ланцюжків обробки звуку: незалежні 10-смугові графічні еквалайзери, АРП та лімітери як для цифрового (DMR), так і для аналогового (ASL) режимів.
* Оптимізація аналогового тракту (ASL): збільшено ліміти обчислювальних ресурсів для Asterisk та розширено мережевий джитер-буфер IAX2.
* Відмовостійкість з'єднання з BrandMeister: автоматичний механізм відмовостійкості (failover) — при втраті зв'язку з поточним майстром BM понад 1 хвилину система автоматично перемикається на наступний сервер із таблиці найменших затримок.
* Ізольований режим вбудованого ехо-тесту («Папуга»). Реалізовано серверну обробку цифрового та аналогового ехо-тесту з тимчасовою ізоляцією WebSocket-сесії клієнта від загального радіоефіру на час калібрування власного голосу.

<!-- lang:de -->
# ProxDMR v2.16 — Änderungsprotokoll

* Der Vocoder/Encoder-Kern wurde durch das deutlich hochwertigere und fortschrittlichere mbelib-neo ersetzt.
* Ein separates asynchrones Empfangspipeline-Modul und ein dedizierter Jitter-Puffer wurden implementiert. Der Netzwerkpaketempfang von BrandMeister ist vollständig von der Dekodierung und Webübertragung isoliert, wodurch Stottern und Audioaussetzer durch Netzwerkschwankungen vermieden werden. Eine Glättung der Übergänge zwischen den Frames wurde hinzugefügt.
* Low-Latency-Web-Engine auf Basis von AudioWorklet. Die Audiowiedergabe im Browser wurde auf ein dediziertes AudioWorklet ausgelagert. Ein 4-stufiger Chebyshev-IIR-Filter zur Abtastraten-Interpolation (8 kHz → 48 kHz) mit effektiver Unterdrückung von Spiegelfrequenzen ohne rechenintensive Fourier-Transformationen wurde implementiert. Automatische dynamische Pufferanpassung an den tatsächlichen Netzwerk-Jitter des Clients.
* Vollständige Trennung der Audioverarbeitungsketten: unabhängige 10-Band-Grafik-Equalizer, AGC und Limiter sowohl für digitale als auch für analoge (ASL) Modi.
* Optimierung des analogen Signalwegs (ASL): Erhöhung der Asterisk-Ressourcenlimits und Erweiterung des IAX2-Netzwerk-Jitter-Puffers.
* Fehlertoleranz für BrandMeister-Verbindungen. Automatischer Failover-Mechanismus: Geht die Verbindung zum aktuellen BM-Master für mehr als 1 Minute verloren, wechselt das System automatisch zum nächsten Server aus der Tabelle mit den niedrigsten Latenzen.
* Isolierter Modus für den integrierten „Parrot“-Echotest. Serverseitige Verarbeitung digitaler und analoger Echotests wurde implementiert, mit temporärer Isolierung der WebSocket-Sitzung des Clients vom allgemeinen Funkverkehr während der Kalibrierung der eigenen Stimme.

<!-- lang:es -->
# ProxDMR v2.16 — Registro de cambios

* Sustitución del núcleo del vocoder/codificador por mbelib-neo, significativamente más avanzado y de mayor calidad.
* Implementación de un módulo de canalización de recepción asíncrono independiente y un búfer de fluctuación (jitter buffer) dedicado. La recepción de paquetes de red de BrandMeister está completamente aislada de la decodificación y transmisión web, eliminando cortes y pérdidas de audio por fluctuaciones de red. Se ha añadido suavizado en las transiciones entre tramas.
* Motor web de baja latencia basado en AudioWorklet. La reproducción de audio en el navegador se ha trasladado a un AudioWorklet dedicado. Se implementó un filtro IIR de Chebyshev de 4 etapas para la interpolación de frecuencia de muestreo (8 kHz → 48 kHz) con supresión eficaz de frecuencias espejo sin transformadas de Fourier intensivas. Adaptación dinámica automática del búfer a la fluctuación de red del cliente.
* Separación completa de las cadenas de procesamiento de audio: ecualizadores gráficos de 10 bandas independientes, AGC y limitadores para los modos digital y analógico (ASL).
* Optimización de la ruta analógica (ASL): mayores límites de recursos para Asterisk y ampliación del búfer de fluctuación de red IAX2.
* Tolerancia a fallos en las conexiones con BrandMeister. Mecanismo de conmutación automática por error: si se pierde la comunicación con el maestro de BM actual durante más de 1 minuto, el sistema cambia automáticamente al siguiente servidor de la tabla de menor latencia.
* Modo aislado para la prueba de eco integrada ("Parrot"). Se ha implementado el procesamiento en el servidor de pruebas de eco digitales y analógicas, con aislamiento temporal de la sesión WebSocket del cliente respecto a las ondas generales durante la calibración de su propia voz.

<!-- lang:fr -->
# ProxDMR v2.16 — Notes de version

* Remplacement du cœur du vocodeur/encodeur par mbelib-neo, nettement plus performant et de meilleure qualité.
* Implémentation d'un module de pipeline de réception asynchrone distinct et d'un tampon de gigue (jitter buffer) dédié. La réception des paquets réseau BrandMeister est totalement isolée du décodage et de la transmission web, éliminant les saccades et coupures audio causées par les fluctuations réseau. Le lissage des transitions entre trames a été ajouté.
* Moteur web à faible latence basé sur AudioWorklet. La lecture audio dans le navigateur a été transférée vers un AudioWorklet dédié. Un filtre IIR Chebyshev à 4 étages a été implémenté pour l'interpolation du taux d'échantillonnage (8 kHz → 48 kHz) avec suppression efficace des fréquences miroirs sans transformées de Fourier gourmandes en ressources. Adaptation dynamique automatique du tampon à la gigue réseau réelle du client.
* Séparation complète des chaînes de traitement audio : égaliseurs graphiques 10 bandes indépendants, AGC et limiteurs pour les modes numérique et analogique (ASL).
* Optimisation de la voie analogique (ASL) : augmentation des limites de ressources d'Asterisk et extension du tampon de gigue réseau IAX2.
* Tolérance aux pannes pour les connexions avec BrandMeister. Mécanisme de basculement automatique : en cas de perte de communication avec le maître BM actuel pendant plus d'une minute, le système bascule automatiquement vers le serveur suivant dans le tableau des latences les plus faibles.
* Mode isolé pour le test d'écho intégré (« Perroquet »). Le traitement côté serveur des tests d'écho numériques et analogiques a été mis en œuvre, avec isolation temporaire de la session WebSocket du client des ondes radio générales pendant l'étalonnage de sa propre voix.

<!-- lang:it -->
# ProxDMR v2.16 — Registro delle modifiche

* Sostituzione del core del vocoder/encoder con mbelib-neo, notevolmente più avanzato e di qualità superiore.
* Implementazione di un modulo di pipeline di ricezione asincrono separato e di un jitter buffer dedicato. La ricezione dei pacchetti di rete BrandMeister è completamente isolata dalla decodifica e dalla trasmissione web, eliminando balbettii e interruzioni audio causati dalle fluttuazioni di rete. È stato aggiunto il livellamento delle transizioni tra i frame.
* Motore web a bassa latenza basato su AudioWorklet. La riproduzione audio nel browser è stata demandata a un AudioWorklet dedicato. È stato implementato un filtro IIR Chebyshev a 4 stadi per l'interpolazione della frequenza di campionamento (8 kHz → 48 kHz) con soppressione efficace delle frequenze speculari senza trasformate di Fourier ad alto consumo di risorse. Adattamento dinamico automatico del buffer al reale jitter di rete del client.
* Separazione completa delle catene di elaborazione audio: equalizzatori grafici a 10 bande indipendenti, AGC e limiter sia per la modalità digitale che per quella analogica (ASL).
* Ottimizzazione del percorso analogico (ASL): incremento dei limiti delle risorse Asterisk ed estensione del jitter buffer di rete IAX2.
* Tolleranza ai guasti per le connessioni con BrandMeister. Meccanismo di failover automatico: in caso di perdita di comunicazione con l'attuale master BM per più di 1 minuto, il sistema passa automaticamente al server successivo dalla tabella a latenza più bassa.
* Modalità isolata per l'echo test integrato ("Pappagallo"). È stata implementata l'elaborazione lato server dei test di eco digitali e analogici, con isolamento temporaneo della sessione WebSocket del client dall'etere generale durante la calibrazione della propria voce.

<!-- lang:nl -->
# ProxDMR v2.16 — Wijzigingslogboek

* De vocoder/encoder-kern is vervangen door het aanzienlijk hoogwaardigere en geavanceerdere mbelib-neo.
* Er is een aparte asynchrone ontvangstpijplijnmodule en een speciale jitterbuffer geïmplementeerd. De netwerkpakketontvangst van BrandMeister is volledig geïsoleerd van decodering en webtransmissie, waardoor haperingen en audio-uitval door netwerkschommelingen worden geëlimineerd. Egalisatie van overgangen tussen frames is toegevoegd.
* Webengine met lage latentie gebaseerd op AudioWorklet. Het afspelen van audio in de browser is overgedragen aan een speciale AudioWorklet. Er is een 4-traps Chebyshev IIR-filter geïmplementeerd voor bemonsteringsfrequentie-interpolatie (8 kHz → 48 kHz) met effectieve onderdrukking van spiegelfrequenties zonder rekenintensieve Fourier-transformaties. Automatische dynamische bufferaanpassing aan de werkelijke netwerkjitter van de client.
* Volledige scheiding van audioverwerkingsketens: onafhankelijke 10-bands grafische equalizers, AGC en limiters voor zowel digitale als analoge (ASL) modi.
* Optimalisatie van het analoge pad (ASL): verhoogde Asterisk-resourcelimieten en uitbreiding van de IAX2-netwerkjitterbuffer.
* Fouttolerantie voor verbindingen met BrandMeister. Automatisch failover-mechanisme: als de communicatie met de huidige BM-master langer dan 1 minuut wegvalt, schakelt het systeem automatisch over naar de volgende server uit de tabel met de laagste latentie.
* Geïsoleerde modus voor de ingebouwde "Papegaai"-echotest. Server-side verwerking van digitale en analoge echotests is geïmplementeerd, met tijdelijke isolatie van de WebSocket-sessie van de client van de algemene ether tijdens kalibratie van de eigen stem.
