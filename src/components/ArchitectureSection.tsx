import { useState } from 'react';
import {
  Activity,
  BellRing,
  Cpu,
  Download,
  Lock,
  Radio,
  Smartphone,
  Zap,
} from 'lucide-react';
import { ARCHITECTURE_BLOCKS, ASSETS, type ArchitectureBlock } from '../data/projectData';
import { ResilientImage } from './ResilientImage';

export function ArchitectureSection() {
  const [viewMode, setViewMode] = useState<'interactive' | 'slide'>('interactive');
  const [selectedId, setSelectedId] = useState<string>('mcu');

  const selectedBlock: ArchitectureBlock =
    ARCHITECTURE_BLOCKS.find((b) => b.id === selectedId) ?? ARCHITECTURE_BLOCKS[1];

  const getBlockIcon = (id: string) => {
    switch (id) {
      case 'mq6':
        return <Activity className="w-4 h-4 text-slate-700" aria-hidden="true" />;
      case 'mcu':
        return <Cpu className="w-4 h-4 text-slate-700" aria-hidden="true" />;
      case 'power':
        return <Zap className="w-4 h-4 text-slate-700" aria-hidden="true" />;
      case 'alarm':
        return <BellRing className="w-4 h-4 text-red-600" aria-hidden="true" />;
      case 'comms':
        return <Radio className="w-4 h-4 text-blue-700" aria-hidden="true" />;
      case 'phone':
        return <Smartphone className="w-4 h-4 text-blue-700" aria-hidden="true" />;
      default:
        return <Lock className="w-4 h-4 text-slate-700" aria-hidden="true" />;
    }
  };

  return (
    <section id="architecture" className="bg-white border-b border-slate-200 py-14 lg:py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-slate-500">
              02. System Architecture &amp; Signal Flow
            </p>
            <h2 className="mt-2 font-display text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Dual-Path Hardware Topology
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Inspect every module from MQ-6 gas sensing to parallel local alarm and SIM800L GSM
              remote notification, or export the presentation block diagram.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Architecture view mode"
            className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 self-start"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'interactive'}
              onClick={() => setViewMode('interactive')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'interactive'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Schematic
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'slide'}
              onClick={() => setViewMode('slide')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'slide'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Slide Block Diagram
            </button>
          </div>
        </div>

        {viewMode === 'interactive' ? (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
                <span>Click any hardware block to inspect pinouts and electrical specs</span>
                <span className="font-mono">5V DC / 18650 Failover</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Input Column */}
                <div className="md:col-span-3 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedId('mq6')}
                    className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedId === 'mq6'
                        ? 'bg-white border-slate-900 ring-2 ring-slate-900/10'
                        : 'bg-white border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {getBlockIcon('mq6')}
                      <span className="font-mono text-[11px] text-slate-500">INPUT</span>
                    </div>
                    <p className="mt-2.5 text-sm font-semibold text-slate-900">
                      MQ-6 LPG Gas Sensor
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-500">
                      Analog A0 · 200–10k ppm
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedId('power')}
                    className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedId === 'power'
                        ? 'bg-white border-slate-900 ring-2 ring-slate-900/10'
                        : 'bg-white border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {getBlockIcon('power')}
                      <span className="font-mono text-[11px] text-slate-500">POWER</span>
                    </div>
                    <p className="mt-2.5 text-sm font-semibold text-slate-900">
                      5V Mains + Li-Ion Backup
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-500">
                      230V AC · 12-hr Cell
                    </p>
                  </button>
                </div>

                {/* Arrow 1 */}
                <div className="hidden md:flex md:col-span-1 items-center justify-center text-slate-400 font-mono text-xs">
                  ───&gt;
                </div>

                {/* Core Microcontroller */}
                <div className="md:col-span-4">
                  <button
                    type="button"
                    onClick={() => setSelectedId('mcu')}
                    className={`w-full text-left p-5 rounded-lg border transition-all cursor-pointer ${
                      selectedId === 'mcu'
                        ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/15'
                        : 'bg-white text-slate-900 border-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Cpu
                        className={`w-5 h-5 ${
                          selectedId === 'mcu' ? 'text-white' : 'text-slate-700'
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={`font-mono text-[11px] ${
                          selectedId === 'mcu' ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        CORE MCU
                      </span>
                    </div>
                    <p className="mt-3 text-base font-bold">
                      ESP32 / NodeMCU Microcontroller
                    </p>
                    <p
                      className={`mt-1.5 text-xs leading-relaxed ${
                        selectedId === 'mcu' ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      100 ms ADC sampling, threshold filtering, concurrent local &amp; remote dispatch
                    </p>
                    <p
                      className={`mt-3 font-mono text-[11px] ${
                        selectedId === 'mcu' ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      GPIO · I2C · UART · PWM
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedId('shutoff')}
                    className={`w-full mt-3 text-left p-3.5 rounded-lg border border-dashed transition-all cursor-pointer ${
                      selectedId === 'shutoff'
                        ? 'bg-white border-slate-900 ring-2 ring-slate-900/10'
                        : 'bg-white border-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">
                        Optional Auto-Shutoff Valve
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">GPIO27</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Servo/Solenoid regulator shutoff @ &ge;1,000 ppm
                    </p>
                  </button>
                </div>

                {/* Arrow 2 */}
                <div className="hidden md:flex md:col-span-1 items-center justify-center text-slate-400 font-mono text-xs">
                  ───&gt;
                </div>

                {/* Parallel Output Branches */}
                <div className="md:col-span-3 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedId('alarm')}
                    className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedId === 'alarm'
                        ? 'bg-white border-red-600 ring-2 ring-red-600/10'
                        : 'bg-white border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {getBlockIcon('alarm')}
                      <span className="font-mono text-[11px] text-red-700 font-medium">
                        BRANCH A
                      </span>
                    </div>
                    <p className="mt-2.5 text-sm font-semibold text-slate-900">
                      Local Alarm Unit
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      85dB Piezo + Red Strobe LED + OLED Display
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedId('comms')}
                    className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedId === 'comms'
                        ? 'bg-white border-blue-700 ring-2 ring-blue-700/10'
                        : 'bg-white border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {getBlockIcon('comms')}
                      <span className="font-mono text-[11px] text-blue-700 font-medium">
                        BRANCH B
                      </span>
                    </div>
                    <p className="mt-2.5 text-sm font-semibold text-slate-900">
                      Wi-Fi / SIM800L GSM
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Dual-path Cloud Push &amp; Offline SMS
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedId('phone')}
                    className={`text-left p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedId === 'phone'
                        ? 'bg-white border-blue-700 ring-2 ring-blue-700/10'
                        : 'bg-white border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {getBlockIcon('phone')}
                      <span className="font-mono text-[11px] text-slate-500">ENDPOINT</span>
                    </div>
                    <p className="mt-2.5 text-sm font-semibold text-slate-900">
                      User Smartphone
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Push Notification + SMS / Voice Alert
                    </p>
                  </button>
                </div>
              </div>
            </div>

            {/* Datasheet Inspector Panel */}
            <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-medium text-slate-500">
                Module Datasheet · {selectedBlock.subsystem}
              </p>
              <h3 className="mt-1.5 font-display text-xl font-bold text-slate-900">
                {selectedBlock.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {selectedBlock.description}
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-4 pt-5 border-t border-slate-200 text-xs">
                <div>
                  <dt className="text-slate-500">Operating Rail</dt>
                  <dd className="mt-0.5 font-mono font-medium text-slate-900 tabular-nums">
                    {selectedBlock.voltage}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Current Budget</dt>
                  <dd className="mt-0.5 font-mono font-medium text-slate-900 tabular-nums">
                    {selectedBlock.current}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Bus / Interface</dt>
                  <dd className="mt-0.5 font-mono font-medium text-slate-900">
                    {selectedBlock.interfaceBus}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Response Time</dt>
                  <dd className="mt-0.5 font-mono font-medium text-slate-900 tabular-nums">
                    {selectedBlock.latency}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 pt-5 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-900">Pinout &amp; Wiring</p>
                <ul className="mt-2 space-y-1.5">
                  {selectedBlock.pins.map((pin) => (
                    <li
                      key={pin}
                      className="font-mono text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200"
                    >
                      {pin}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-900">Field Reliability Note</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {selectedBlock.resilienceNote}
                </p>
              </div>
            </aside>
          </div>
        ) : (
          <div className="mt-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Technical Presentation Block Diagram (16:9 Slide Asset)
                </p>
                <p className="text-xs text-slate-500">
                  Generated from Project #87 architecture prompt for pitch decks and RAHI documentation
                </p>
              </div>
              <a
                href={ASSETS.blockDiagram}
                download="project-87-lpg-block-diagram.jpg"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Download Diagram</span>
              </a>
            </div>
            <div className="p-4 sm:p-8 bg-white flex justify-center">
              <ResilientImage
                src={ASSETS.blockDiagram}
                alt="Technical block diagram of Project #87 Smart LPG Leakage Monitoring System showing MQ-6 sensor, ESP32/NodeMCU, Local Alarm Unit, and Wi-Fi/SIM800L GSM notification to smartphone"
                fallbackTitle="IoT Smart LPG Monitoring System Block Diagram"
                fallbackSubtitle="MQ-6 Sensor -> ESP32/NodeMCU -> Local Alarm Unit & Wi-Fi/SIM800L GSM Alert"
                className="w-full max-w-4xl rounded-lg border border-slate-100 object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
