export const ASSETS = {
  productPhoto: '/src/assets/images/product_lpg_kitchen_1795064628648.jpg',
  blockDiagram: '/src/assets/images/system_block_diagram_1795064627448.jpg',
  ruralKitchen: '/src/assets/images/rural_anganwadi_kitchen_1795064628491.jpg',
} as const;

export interface ArchitectureBlock {
  id: string;
  title: string;
  shortLabel: string;
  subsystem: 'Input' | 'Core' | 'Local Output' | 'Remote Output' | 'Optional Safety';
  voltage: string;
  current: string;
  interfaceBus: string;
  latency: string;
  description: string;
  pins: string[];
  resilienceNote: string;
}

export const ARCHITECTURE_BLOCKS: ArchitectureBlock[] = [
  {
    id: 'mq6',
    title: 'MQ-6 LPG Gas Sensor',
    shortLabel: 'MQ-6 Sensor',
    subsystem: 'Input',
    voltage: '5.0 V DC',
    current: '150 mA (heater)',
    interfaceBus: 'ADC (GPIO34) + Digital D0',
    latency: '< 1.2 s response',
    description:
      'SnO2 semiconductor gas sensing layer calibrated for high sensitivity to propane and butane (200–10,000 ppm) with minimal false triggers from cooking steam or smoke.',
    pins: ['VCC -> 5V Boost Rail', 'GND -> Common Ground', 'A0 -> ESP32 ADC1_CH6', 'D0 -> Threshold Interrupt'],
    resilienceNote: 'Pre-heat stabilization routine ignores boot-up spikes during first 20 seconds.',
  },
  {
    id: 'mcu',
    title: 'ESP32 / NodeMCU Microcontroller',
    shortLabel: 'ESP32 / NodeMCU',
    subsystem: 'Core',
    voltage: '3.3 V logic (5 V VIN)',
    current: '80 mA avg / 240 mA Wi-Fi burst',
    interfaceBus: 'ADC, I2C, UART, PWM, GPIO',
    latency: '100 ms sample loop',
    description:
      'Dual-core controller sampling MQ-6 analog voltage through a 5-point moving average filter, driving both the local alarm unit and dual-path communication stack concurrently.',
    pins: ['GPIO34: MQ-6 Analog In', 'GPIO21/22: I2C OLED', 'GPIO16/17: UART2 SIM800L', 'GPIO25: Piezo PWM'],
    resilienceNote: 'Hardware watchdog timer resets stuck network sockets without interrupting local alarm.',
  },
  {
    id: 'power',
    title: '5V Mains + 18650 Battery Backup',
    shortLabel: '5V + Li-Ion Backup',
    subsystem: 'Core',
    voltage: '230 V AC -> 5 V / 3.7 V Li-Ion',
    current: '1,200 mAh / 12-hr standby',
    interfaceBus: 'TP4056 + MT3608 Boost',
    latency: '0 ms seamless switchover',
    description:
      'Wall-plug 5V SMPS keeps the internal 18650 lithium-ion cell trickle-charged and switches instantaneously to battery power during rural grid blackouts.',
    pins: ['AC L/N -> Isolated 5V/2A SMPS', 'TP4056 B+/B- -> 18650 Cell', 'MT3608 Out -> 5.0V Sensor Rail'],
    resilienceNote: 'Critical for rural kitchens where power cuts often coincide with evening cooking hours.',
  },
  {
    id: 'alarm',
    title: 'Local Alarm Unit (85dB + Strobe + OLED)',
    shortLabel: 'Local Alarm Unit',
    subsystem: 'Local Output',
    voltage: '5.0 V / 3.3 V I2C',
    current: '45 mA active alarm',
    interfaceBus: 'PWM + GPIO + I2C (0x3C)',
    latency: '< 150 ms activation',
    description:
      'Immediate multi-sensory warning for household occupants: 85dB piezo buzzer driven at resonant 2.4 kHz, high-intensity red strobe LED, and 0.96-inch OLED readout.',
    pins: ['GPIO25 -> NPN Driver -> Piezo', 'GPIO26 -> Red Strobe LED Array', 'SDA/SCL -> SSD1306 OLED'],
    resilienceNote: 'Operates completely independently of Wi-Fi or cellular signal strength.',
  },
  {
    id: 'comms',
    title: 'Dual Wi-Fi + SIM800L GSM Module',
    shortLabel: 'Wi-Fi / SIM800L GSM',
    subsystem: 'Remote Output',
    voltage: '3.8–4.2 V (2A peak burst)',
    current: '22 mA idle / 1.8 A TX burst',
    interfaceBus: 'UART AT Commands + MQTT/HTTPS',
    latency: '1.8–2.5 s SMS / Push',
    description:
      'Attempts instant Wi-Fi push notification first; if no router or internet is present, automatically falls back to SIM800L 2G/GSM SMS and voice call alert.',
    pins: ['UART TX/RX -> Level Shifter -> ESP32', '2200uF Low-ESR Cap on VBAT', 'Helical PCB GSM Antenna'],
    resilienceNote: 'Eliminates the broadband Wi-Fi requirement that prices out rural and low-income homes.',
  },
  {
    id: 'phone',
    title: 'User Smartphone (Push + SMS/Call)',
    shortLabel: 'User Smartphone',
    subsystem: 'Remote Output',
    voltage: 'N/A (Cloud / Cellular)',
    current: 'Zero hardware draw',
    interfaceBus: 'MQTT Push / GSM SMS / Auto-Call',
    latency: '< 3 s end-to-end',
    description:
      'Delivers actionable alerts to up to 3 registered family or neighbor phone numbers, including estimated ppm severity and whether auto-shutoff engaged.',
    pins: ['Primary Number: Homeowner', 'Secondary Number: Neighbor / Warden', 'Emergency Call Escalation @ >2,000 ppm'],
    resilienceNote: 'Works on basic feature phones via standard SMS/voice call as well as smartphones.',
  },
  {
    id: 'shutoff',
    title: 'Optional Auto-Shutoff Regulator Valve',
    shortLabel: 'Auto-Shutoff Valve',
    subsystem: 'Optional Safety',
    voltage: '5.0 V / 12 V Pulse',
    current: '350 mA (1.5 s actuation)',
    interfaceBus: 'Relay / High-Torque Servo GPIO27',
    latency: '1.5 s mechanical close',
    description:
      'Add-on clamp-on MG996R high-torque servo or inline solenoid that physically rotates the domestic cylinder regulator knob to OFF when leak exceeds 1,000 ppm.',
    pins: ['GPIO27 -> Servo PWM Signal', '5V Dedicated Buck Rail', 'Manual Override Lever Retained'],
    resilienceNote: 'Non-invasive clamp design avoids modifying pressurized brass cylinder fittings.',
  },
];

export type BomScale = '1' | '100' | '1000';
export type HardwareVariant = 'dual' | 'wifi';

export interface BomComponent {
  id: string;
  name: string;
  spec: string;
  requiresGsm: boolean;
  prices: Record<BomScale, number>;
}

export const BOM_COMPONENTS: BomComponent[] = [
  {
    id: 'mq6',
    name: 'MQ-6 LPG Gas Sensor Module',
    spec: 'SnO2 high-sensitivity propane/butane element + LM393 comparator',
    requiresGsm: false,
    prices: { '1': 85, '100': 62, '1000': 46 },
  },
  {
    id: 'mcu',
    name: 'ESP32 / NodeMCU ESP8266 Core',
    spec: 'Wi-Fi MCU with onboard ADC, I2C, UART & watchdog firmware',
    requiresGsm: false,
    prices: { '1': 240, '100': 175, '1000': 135 },
  },
  {
    id: 'gsm',
    name: 'SIM800L GSM/GPRS Module + Helical Antenna',
    spec: 'Quad-band cellular SMS & voice call fallback (works without Wi-Fi)',
    requiresGsm: true,
    prices: { '1': 220, '100': 168, '1000': 132 },
  },
  {
    id: 'alarm',
    name: '85dB Piezo Buzzer + Red Strobe LED + Driver',
    spec: '2.4 kHz active-resonant transducer + high-luminance 5mm strobe array',
    requiresGsm: false,
    prices: { '1': 45, '100': 30, '1000': 21 },
  },
  {
    id: 'oled',
    name: '0.96" I2C OLED Display (128x64)',
    spec: 'High-contrast SSD1306 status screen showing live PPM & state',
    requiresGsm: false,
    prices: { '1': 70, '100': 52, '1000': 38 },
  },
  {
    id: 'power',
    name: '5V/2A SMPS + TP4056 + 18650 Backup Cell',
    spec: 'Direct wall-plug power with automatic 12-hour blackout backup',
    requiresGsm: false,
    prices: { '1': 130, '100': 98, '1000': 74 },
  },
  {
    id: 'enclosure',
    name: 'Flame-Retardant ABS Enclosure & Custom PCB',
    spec: 'UL94-V0 vented housing with integrated Indian 3-pin plug prongs',
    requiresGsm: false,
    prices: { '1': 95, '100': 65, '1000': 44 },
  },
];

export interface ComparisonRow {
  feature: string;
  project87: string;
  commercial: string;
  advantage: string;
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: 'Unit Hardware Cost',
    project87: '₹590 – ₹885 (Scale / Prototype)',
    commercial: '₹3,000 – ₹5,000+',
    advantage: '75–85% lower upfront barrier for households',
  },
  {
    feature: 'Internet / Wi-Fi Dependency',
    project87: 'Dual Wi-Fi + SIM800L GSM SMS Fallback',
    commercial: 'Requires constant broadband Wi-Fi',
    advantage: 'Protects rural kitchens & feature-phone owners',
  },
  {
    feature: 'Power-Cut Resilience',
    project87: 'Built-in 18650 Li-Ion (12-hr backup)',
    commercial: 'Goes offline when mains power drops',
    advantage: 'Active protection during evening load-shedding',
  },
  {
    feature: 'Installation Complexity',
    project87: 'Plug-and-play wall socket form factor',
    commercial: 'Wall drilling, wiring & app pairing',
    advantage: 'Zero tools; ready in under 60 seconds',
  },
  {
    feature: 'Local & Remote Escalation',
    project87: '85dB Piezo + Strobe + OLED + SMS/Call',
    commercial: 'App push only or local beep only',
    advantage: 'Alerts occupants inside & owners away simultaneously',
  },
];

export interface ScenarioPreset {
  id: string;
  label: string;
  targetPpm: number;
  mainsPower: boolean;
  networkMode: 'dual' | 'gsm' | 'wifi';
  autoShutoff: boolean;
  summary: string;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'normal',
    label: 'Normal Cooking',
    targetPpm: 110,
    mainsPower: true,
    networkMode: 'dual',
    autoShutoff: true,
    summary: 'Ambient baseline near stove with trace cooking vapors ignored by moving-average filter.',
  },
  {
    id: 'slow-seep',
    label: 'Slow Hose Seep',
    targetPpm: 540,
    mainsPower: true,
    networkMode: 'dual',
    autoShutoff: false,
    summary: 'Early-stage cracked rubber Suraksha pipe leak crossing 300 ppm early-warning threshold.',
  },
  {
    id: 'flameout',
    label: 'Burner Flameout',
    targetPpm: 1650,
    mainsPower: true,
    networkMode: 'dual',
    autoShutoff: true,
    summary: 'Unignited burner gas buildup above 1,000 ppm triggering 85dB alarm, mobile alert, and regulator shutoff.',
  },
  {
    id: 'blackout-leak',
    label: 'Power Cut + Leak',
    targetPpm: 1420,
    mainsPower: false,
    networkMode: 'gsm',
    autoShutoff: true,
    summary: 'Grid blackout disables home Wi-Fi; 18650 battery powers MQ-6 & SIM800L GSM SMS alert.',
  },
];

export const PITCH_COPY = {
  summary: `Project Title: #87 – Smart Monitoring of LPG Leakage with Local Alarm and Remote Notification
Program: IIT Ropar RAHI Innovation Submission

Why This Is a Winning Idea:
Millions of Indian households, rural kitchens, and small eateries rely on LPG cylinders every day, yet almost none have an early-warning leak detection system because existing smart detectors cost ₹3,000–₹5,000+ and require constant high-speed Wi-Fi. Our project solves this critical safety gap with an ultra-affordable (under ₹600–₹1,000), plug-and-play IoT gas detector engineered specifically for Indian homes and rural conditions. Using a high-sensitivity MQ-6 sensor, it triggers an immediate 85dB local audio-visual alarm for people inside the house while simultaneously sending instant mobile/SMS alerts (via Wi-Fi or GSM) to the owner—even when they are away or offline. Its low cost, zero-installation simplicity, optional auto-shutoff capability, and direct life-saving impact across homes, Anganwadis, and small businesses make it a practical, scalable grassroots innovation ideal for the IIT Ropar RAHI program.`,

  imagePrompt: `A realistic, high-resolution product photograph of a compact, white plug-and-play smart LPG gas leak detector plugged into a wall socket right next to a red domestic LPG cylinder in an Indian kitchen. The small device has glowing red warning LEDs, a tiny OLED screen displaying "GAS LEAK DETECTED", and a piezo buzzer. In the foreground, a person's hand holds a smartphone showing an urgent mobile notification alert: "URGENT: LPG Gas Leak Detected - Kitchen". Clean natural lighting, modern realistic photography style.`,

  diagramPrompt: `Clean, professional technical block diagram for an IoT Smart LPG Leakage Monitoring System. Left block: "MQ-6 LPG Gas Sensor" feeding into center block: "ESP32 / NodeMCU Microcontroller (5V Power + Battery Backup)". From the center microcontroller, two parallel output branches on the right: Top branch goes to "Local Alarm Unit (85dB Piezo Buzzer + Red Strobe LED + OLED Display)"; Bottom branch goes to "Communication Module (Wi-Fi / SIM800L GSM)" pointing to "User Smartphone (Push Notification + SMS/Call Alert)". Minimalist white background, crisp icons, engineering presentation style.`,
};
