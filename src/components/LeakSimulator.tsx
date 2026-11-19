import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BatteryCharging,
  Bell,
  CheckCircle2,
  Lock,
  PlugZap,
  RotateCcw,
  ShieldAlert,
  Smartphone,
  Unlock,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { SCENARIO_PRESETS, type ScenarioPreset } from '../data/projectData';

interface LeakSimulatorProps {
  externalTestTrigger: number;
}

interface LogEntry {
  id: string;
  time: string;
  channel: string;
  message: string;
  severity: 'nominal' | 'warning' | 'critical';
}

function formatClockTime(date = new Date()): string {
  return date.toLocaleTimeString('en-IN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function LeakSimulator({ externalTestTrigger }: LeakSimulatorProps) {
  const [targetPpm, setTargetPpm] = useState<number>(115);
  const [livePpm, setLivePpm] = useState<number>(115);
  const [history, setHistory] = useState<number[]>(() =>
    Array.from({ length: 30 }, () => 110 + Math.round((Math.random() - 0.5) * 14))
  );
  const [mainsPower, setMainsPower] = useState<boolean>(true);
  const [networkMode, setNetworkMode] = useState<'dual' | 'gsm' | 'wifi'>('dual');
  const [autoShutoffEnabled, setAutoShutoffEnabled] = useState<boolean>(true);
  const [valveClosed, setValveClosed] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string>('normal');
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      time: formatClockTime(),
      channel: 'MQ-6 ADC',
      message: 'Pre-heat stabilization complete. Baseline ambient reading at 115 ppm.',
      severity: 'nominal',
    },
  ]);

  const prevStatusRef = useRef<'nominal' | 'warning' | 'critical'>('nominal');
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Triggered when TopBar "Run Leak Test" is clicked
  useEffect(() => {
    if (externalTestTrigger > 0) {
      setActivePresetId('flameout');
      setTargetPpm(1650);
      setMainsPower(true);
      setNetworkMode('dual');
      setAutoShutoffEnabled(true);
    }
  }, [externalTestTrigger]);

  // Smoothly interpolate live sensor reading & sample waveform every 700ms
  useEffect(() => {
    const timer = window.setInterval(() => {
      setLivePpm((prev) => {
        const diff = targetPpm - prev;
        const step = Math.abs(diff) < 8 ? diff : Math.round(diff * 0.38);
        const jitter = Math.round((Math.random() - 0.5) * 18);
        const next = Math.max(40, Math.min(5000, prev + step + jitter));
        setHistory((h) => [...h.slice(1), next]);
        return next;
      });
    }, 700);

    return () => window.clearInterval(timer);
  }, [targetPpm]);

  const status: 'nominal' | 'warning' | 'critical' = useMemo(() => {
    if (livePpm >= 1000) return 'critical';
    if (livePpm >= 300) return 'warning';
    return 'nominal';
  }, [livePpm]);

  // Auto-shutoff solenoid triggers at critical threshold when enabled
  useEffect(() => {
    if (status === 'critical' && autoShutoffEnabled && !valveClosed) {
      setValveClosed(true);
    }
  }, [status, autoShutoffEnabled, valveClosed]);

  // Dispatch timestamped telemetry logs on state transitions
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (prev === status) return;
    prevStatusRef.current = status;

    const now = formatClockTime();
    if (status === 'critical') {
      const deliveryChannel =
        networkMode === 'wifi'
          ? 'Wi-Fi Push'
          : networkMode === 'gsm'
          ? 'SIM800L GSM SMS'
          : mainsPower
          ? 'Wi-Fi + GSM SMS'
          : 'SIM800L GSM (Battery)';

      const newEntries: LogEntry[] = [
        {
          id: `crit-${Date.now()}-1`,
          time: now,
          channel: 'LOCAL ALARM',
          message: `Threshold >=1,000 ppm breached (${livePpm} ppm). 85dB Piezo & Strobe active.`,
          severity: 'critical',
        },
        {
          id: `crit-${Date.now()}-2`,
          time: now,
          channel: deliveryChannel,
          message: `Dispatched: "URGENT: LPG Gas Leak Detected - Kitchen (${livePpm} ppm)."`,
          severity: 'critical',
        },
      ];

      if (autoShutoffEnabled) {
        newEntries.push({
          id: `crit-${Date.now()}-3`,
          time: now,
          channel: 'GPIO27 VALVE',
          message: 'Auto-shutoff servo rotated cylinder regulator to CLOSED.',
          severity: 'critical',
        });
      }

      setLogs((old) => [...newEntries, ...old].slice(0, 14));
    } else if (status === 'warning') {
      const entry: LogEntry = {
        id: `warn-${Date.now()}`,
        time: now,
        channel: 'MQ-6 SENSOR',
        message: `Elevated LPG vapor detected (${livePpm} ppm). Monitoring for leak escalation.`,
        severity: 'warning',
      };
      setLogs((old) => [entry, ...old].slice(0, 14));
    } else {
      const entry: LogEntry = {
        id: `nom-${Date.now()}`,
        time: now,
        channel: 'SYSTEM',
        message: `Gas concentration returned to safe range (${livePpm} ppm). Local alarm silenced.`,
        severity: 'nominal',
      };
      setLogs((old) => [entry, ...old].slice(0, 14));
    }
  }, [status, livePpm, networkMode, mainsPower, autoShutoffEnabled]);

  // Authentic Web Audio API 2.4 kHz pulsed piezo buzzer when enabled & critical
  useEffect(() => {
    if (!audioEnabled || status !== 'critical') {
      return;
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const pulseBeep = () => {
      if (ctx.state !== 'running') return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(2400, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.19);
    };

    pulseBeep();
    const interval = window.setInterval(pulseBeep, 420);

    return () => {
      window.clearInterval(interval);
    };
  }, [audioEnabled, status]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
      }
    };
  }, []);

  const applyPreset = (preset: ScenarioPreset) => {
    setActivePresetId(preset.id);
    setTargetPpm(preset.targetPpm);
    setMainsPower(preset.mainsPower);
    setNetworkMode(preset.networkMode);
    setAutoShutoffEnabled(preset.autoShutoff);
    if (preset.targetPpm < 1000) {
      setValveClosed(false);
    }
  };

  const resetAll = () => {
    setActivePresetId('normal');
    setTargetPpm(110);
    setLivePpm(110);
    setMainsPower(true);
    setNetworkMode('dual');
    setAutoShutoffEnabled(true);
    setValveClosed(false);
    setAudioEnabled(false);
    setLogs([
      {
        id: `reset-${Date.now()}`,
        time: formatClockTime(),
        channel: 'SYSTEM',
        message: 'Simulation reset to nominal household monitoring state.',
        severity: 'nominal',
      },
    ]);
  };

  // Compute SVG polyline points for rolling 30-sample chart (0 - 3000 ppm scale clamped at 5000)
  const chartMax = Math.max(2200, ...history, targetPpm);
  const svgWidth = 520;
  const svgHeight = 140;
  const points = history
    .map((val, idx) => {
      const x = (idx / (history.length - 1)) * svgWidth;
      const y = svgHeight - (Math.min(val, chartMax) / chartMax) * (svgHeight - 16) - 8;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const warnY = svgHeight - (300 / chartMax) * (svgHeight - 16) - 8;
  const critY = svgHeight - (1000 / chartMax) * (svgHeight - 16) - 8;

  const activeCommsRoute = !mainsPower && networkMode === 'wifi'
    ? 'Router Offline (Mains Cut)'
    : networkMode === 'gsm' || (!mainsPower && networkMode === 'dual')
    ? 'SIM800L GSM Cellular SMS'
    : 'Wi-Fi Push + GSM Standby';

  const mq6Voltage = (0.45 + (livePpm / 5000) * 4.1).toFixed(2);

  return (
    <section id="simulator" className="bg-slate-50 border-b border-slate-200 py-14 lg:py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-slate-500">
              01. Interactive Hardware &amp; Alert Sandbox
            </p>
            <h2 className="mt-2 font-display text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Live LPG Leak &amp; Dual-Notification Simulator
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Adjust LPG gas concentration or trigger a real-world failure scenario to observe the
              OLED readout, 85dB piezo alarm, auto-shutoff valve, and offline GSM smartphone alert.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAudioEnabled((v) => !v)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                audioEnabled
                  ? 'bg-red-50 border-red-300 text-red-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
              }`}
            >
              {audioEnabled ? (
                <Volume2 className="w-4 h-4 text-red-600" aria-hidden="true" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" aria-hidden="true" />
              )}
              <span>{audioEnabled ? '85dB Piezo Audio: ON' : 'Enable Buzzer Audio'}</span>
            </button>

            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-slate-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Scenario Preset Strip */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1">Test Scenarios:</span>
          {SCENARIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                activePresetId === preset.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Two-Zone Sandbox Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT STAGE: Hardware Twin + Smartphone Alert Preview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Hardware Twin &amp; Remote Mobile Endpoint
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Synchronized socket-unit telemetry and household owner smartphone screen
                  </p>
                </div>

                {/* Dual-coded state readout (icon + text, never hue alone) */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${
                    status === 'critical'
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : status === 'warning'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {status === 'critical' ? (
                    <ShieldAlert className="w-4 h-4 text-red-600" aria-hidden="true" />
                  ) : status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  )}
                  <span>
                    {status === 'critical'
                      ? 'CRITICAL LEAK'
                      : status === 'warning'
                      ? 'ELEVATED VAPOR'
                      : 'NOMINAL'}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Physical Plug-in Unit Face */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                      <span>SOCKET UNIT · MQ-6</span>
                      <span className="font-mono">
                        {mainsPower ? '230V AC' : '18650 BATT'}
                      </span>
                    </div>

                    {/* Strobe LED + Piezo Indicator */}
                    <div className="mt-4 flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3.5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          aria-hidden="true"
                          className={`w-4 h-4 rounded-full border ${
                            status === 'critical'
                              ? 'bg-red-600 border-red-700 shadow-[0_0_14px_rgba(220,38,38,0.85)]'
                              : status === 'warning'
                              ? 'bg-amber-500 border-amber-600'
                              : 'bg-slate-300 border-slate-400'
                          }`}
                        />
                        <span className="text-xs font-semibold text-slate-800">
                          {status === 'critical'
                            ? 'Red Strobe + 85dB Siren'
                            : status === 'warning'
                            ? 'Amber Pre-Alert LED'
                            : 'Strobe Standby'}
                        </span>
                      </div>
                      <Bell
                        className={`w-4 h-4 ${
                          status === 'critical' ? 'text-red-600' : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                    </div>

                    {/* 0.96" I2C OLED Display */}
                    <div
                      aria-label="OLED hardware display"
                      className={`mt-4 rounded-lg p-4 border-2 font-mono ${
                        status === 'critical'
                          ? 'bg-slate-950 border-red-600 text-red-400'
                          : status === 'warning'
                          ? 'bg-slate-950 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-700 text-sky-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5">
                        <span>SSD1306 128x64</span>
                        <span>{mainsPower ? 'AC' : 'BAT 94%'}</span>
                      </div>
                      <p className="mt-2.5 text-sm font-semibold tracking-tight">
                        {status === 'critical'
                          ? 'GAS LEAK DETECTED!'
                          : status === 'warning'
                          ? 'WARNING: LPG ELEVATED'
                          : 'MONITORING: SAFE'}
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-white">
                        {livePpm} PPM
                      </p>
                      <p className="mt-2 text-[11px] text-slate-300">
                        {status === 'critical'
                          ? 'ALERT SENT · VENTILATE'
                          : status === 'warning'
                          ? 'CHECK STOVE & HOSE'
                          : 'MQ-6 HEATER READY'}
                      </p>
                    </div>
                  </div>

                  {/* Regulator Auto-Shutoff Status */}
                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      {valveClosed ? (
                        <Lock className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
                      ) : (
                        <Unlock className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
                      )}
                      <span className="font-medium text-slate-800">
                        Regulator Valve:{' '}
                        <strong className={valveClosed ? 'text-red-700' : 'text-slate-900'}>
                          {autoShutoffEnabled
                            ? valveClosed
                              ? 'CLOSED (AUTO)'
                              : 'OPEN'
                            : 'MANUAL ONLY'}
                        </strong>
                      </span>
                    </div>
                    {valveClosed && status !== 'critical' && (
                      <button
                        type="button"
                        onClick={() => setValveClosed(false)}
                        className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer whitespace-nowrap"
                      >
                        Re-open
                      </button>
                    )}
                  </div>
                </div>

                {/* User Smartphone Notification Preview */}
                <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between border border-slate-800">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Owner Phone · +91 98XXX X4210</span>
                      </span>
                      <span className="font-mono tabular-nums">{formatClockTime()}</span>
                    </div>

                    <div className="mt-4">
                      {status === 'critical' ? (
                        <div className="bg-white text-slate-900 rounded-lg p-4 border-2 border-red-500">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-red-700">
                            <span>URGENT SAFETY ALERT</span>
                            <span className="font-mono">NOW</span>
                          </div>
                          <p className="mt-1.5 text-sm font-bold text-slate-900">
                            URGENT: LPG Gas Leak Detected - Kitchen
                          </p>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed tabular-nums">
                            Measured {livePpm} ppm via MQ-6 sensor.
                            {autoShutoffEnabled
                              ? ' Auto-shutoff valve engaged.'
                              : ' Turn off cylinder regulator immediately.'}
                          </p>
                          <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
                            <span>Via: {activeCommsRoute}</span>
                            <span>SMS + Call</span>
                          </div>
                        </div>
                      ) : status === 'warning' ? (
                        <div className="bg-slate-800 border border-amber-500/60 rounded-lg p-4">
                          <p className="text-[11px] font-semibold text-amber-300">
                            PRE-ALERT TELEMETRY
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            Elevated LPG Concentration ({livePpm} ppm)
                          </p>
                          <p className="mt-1 text-xs text-slate-300">
                            Sensor monitoring closely. Emergency SMS triggers automatically at 1,000 ppm.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4">
                          <p className="text-[11px] font-semibold text-emerald-400">
                            ALL CLEAR · KITCHEN SAFE
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            No LPG Leak Detected
                          </p>
                          <p className="mt-1 text-xs text-slate-300">
                            {!mainsPower && networkMode === 'wifi'
                              ? 'Warning: Wi-Fi-only mode offline during mains power cut. Switch to Dual/GSM.'
                              : `Heartbeat active via ${activeCommsRoute}.`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400 text-[11px]">Active Path</p>
                      <p className="mt-0.5 font-medium text-slate-100 truncate">
                        {activeCommsRoute}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[11px]">Power Source</p>
                      <p className="mt-0.5 font-medium text-slate-100">
                        {mainsPower ? '230V Wall Socket' : '18650 Battery Backup'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Rolling Telemetry Waveform */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    MQ-6 Sensor Concentration Curve
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time parts-per-million (ppm) stream with 300 ppm warning &amp; 1,000 ppm alarm lines
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                  <span className="text-slate-600">
                    ADC: <strong className="text-slate-900">{mq6Voltage} V</strong>
                  </span>
                  <span className="text-slate-600">
                    Live: <strong className="text-slate-900">{livePpm} ppm</strong>
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-36 overflow-visible"
                  role="img"
                  aria-label={`Live LPG concentration chart currently reading ${livePpm} parts per million`}
                >
                  {/* Reference lines */}
                  <line
                    x1={0}
                    y1={warnY}
                    x2={svgWidth}
                    y2={warnY}
                    stroke="#d97706"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text x={6} y={warnY - 4} fill="#b45309" fontSize="10" fontFamily="IBM Plex Mono">
                    300 ppm Early Warning
                  </text>

                  <line
                    x1={0}
                    y1={critY}
                    x2={svgWidth}
                    y2={critY}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    strokeWidth="1.25"
                  />
                  <text x={6} y={critY - 4} fill="#b91c1c" fontSize="10" fontFamily="IBM Plex Mono">
                    1,000 ppm Critical Alarm
                  </text>

                  <polyline
                    fill="none"
                    stroke={
                      status === 'critical'
                        ? '#dc2626'
                        : status === 'warning'
                        ? '#d97706'
                        : '#0f172a'
                    }
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* RIGHT DECK: Parameter Controls & Delivery Log */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="lpg-ppm-slider"
                    className="text-sm font-semibold text-slate-900"
                  >
                    LPG Gas Concentration
                  </label>
                  <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                    {targetPpm} ppm
                  </span>
                </div>
                <input
                  id="lpg-ppm-slider"
                  type="range"
                  min={50}
                  max={3500}
                  step={25}
                  value={targetPpm}
                  onChange={(e) => {
                    setActivePresetId('custom');
                    setTargetPpm(Number(e.target.value));
                  }}
                  className="mt-3 w-full accent-red-600 cursor-pointer"
                />
                <div className="mt-1.5 flex justify-between text-[11px] font-mono text-slate-500">
                  <span>50 ppm (Clean)</span>
                  <span>300 ppm</span>
                  <span>1,000 ppm</span>
                  <span>3,500 ppm</span>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-900 mb-2.5">
                  Communication Module Mode
                </p>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  {(
                    [
                      { id: 'dual', label: 'Dual Wi-Fi+GSM' },
                      { id: 'gsm', label: 'GSM Offline' },
                      { id: 'wifi', label: 'Wi-Fi Only' },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setNetworkMode(mode.id)}
                      className={`px-2 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        networkMode === mode.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    {mainsPower ? (
                      <PlugZap className="w-4 h-4 text-slate-700" aria-hidden="true" />
                    ) : (
                      <BatteryCharging className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        230V Mains Power Supply
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Toggle off to simulate rural grid power outage
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={mainsPower}
                    onClick={() => setMainsPower((v) => !v)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                      mainsPower
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-amber-50 text-amber-900 border-amber-300'
                    }`}
                  >
                    {mainsPower ? 'Mains ON' : 'Battery Backup'}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    {networkMode === 'wifi' && !mainsPower ? (
                      <WifiOff className="w-4 h-4 text-red-600" aria-hidden="true" />
                    ) : (
                      <Wifi className="w-4 h-4 text-slate-700" aria-hidden="true" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        Optional Auto-Shutoff Regulator
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Automatically closes cylinder knob at &ge;1,000 ppm
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoShutoffEnabled}
                    onClick={() => setAutoShutoffEnabled((v) => !v)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                      autoShutoffEnabled
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {autoShutoffEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>

            {/* Event & SMS Dispatch Log */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Alert &amp; Telemetry Event Log
                </h3>
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Clear
                </button>
              </div>

              {logs.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500">
                  No events logged yet. Adjust the LPG slider above 300 ppm to generate alerts.
                </p>
              ) : (
                <ul className="mt-3 space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {logs.map((entry) => (
                    <li
                      key={entry.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-mono font-semibold ${
                            entry.severity === 'critical'
                              ? 'text-red-700'
                              : entry.severity === 'warning'
                              ? 'text-amber-700'
                              : 'text-slate-700'
                          }`}
                        >
                          {entry.channel}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                          {entry.time}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-700 leading-relaxed">{entry.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
