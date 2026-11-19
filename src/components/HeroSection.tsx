import { ArrowRight, Download } from 'lucide-react';
import { ASSETS } from '../data/projectData';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onLaunchSimulator: () => void;
}

export function HeroSection({ onLaunchSimulator }: HeroSectionProps) {
  return (
    <section id="top" className="bg-white border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-medium text-slate-500 tracking-wide">
                Project #87
                <span aria-hidden="true" className="mx-2">·</span>
                IIT Ropar RAHI Innovation
                <span aria-hidden="true" className="mx-2">·</span>
                Plug-and-Play IoT Safety
              </p>

              <h1 className="mt-4 font-display text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-slate-900 text-balance">
                Smart LPG Leakage Monitoring Under ₹1,000
              </h1>

              <p className="mt-5 text-base leading-relaxed text-slate-600 max-w-xl">
                Existing smart gas detectors cost ₹3,000–₹5,000+ and fail without broadband Wi-Fi.
                Project #87 delivers a socket-ready MQ-6 detector engineered for Indian homes,
                rural kitchens, and Anganwadis—combining an immediate 85dB local alarm with
                offline SIM800L GSM and Wi-Fi alerts.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onLaunchSimulator}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <span>Open Live Simulator</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <a
                href="#pitch-kit"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>Pitch Assets &amp; Diagrams</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col">
              <div className="flex-1 min-h-[280px] lg:min-h-[380px] overflow-hidden">
                <ResilientImage
                  src={ASSETS.productPhoto}
                  alt="Compact white plug-and-play smart LPG gas leak detector plugged near a red domestic LPG cylinder with OLED warning display and urgent smartphone notification"
                  fallbackTitle="Plug-and-Play LPG Leak Detector Unit"
                  fallbackSubtitle="Wall-socket MQ-6 hardware unit with OLED screen, 85dB buzzer, and smartphone alert."
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-4 text-xs text-slate-600">
                <span>Product Concept: Socket-Mount MQ-6 Unit + Mobile Alert</span>
                <span className="font-mono text-slate-500 whitespace-nowrap">4:3 Prototype Render</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              ₹590 – ₹885
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Target BOM cost at scale vs ₹3,000–₹5,000+ market units
            </p>
          </div>

          <div>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              85 dB
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Immediate local piezo siren, red strobe LED &amp; OLED readout
            </p>
          </div>

          <div>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              Wi-Fi + GSM
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Dual-path mobile push &amp; offline SIM800L SMS/Call alert
            </p>
          </div>

          <div>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              12 Hours
            </p>
            <p className="text-xs text-slate-500 mt-1">
              18650 Li-Ion backup active through rural grid blackouts
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
