import { useMemo, useState } from 'react';
import {
  ASSETS,
  BOM_COMPONENTS,
  COMPARISON_ROWS,
  type BomScale,
  type HardwareVariant,
} from '../data/projectData';
import { ResilientImage } from './ResilientImage';

export function BomAndImpactSection() {
  const [scale, setScale] = useState<BomScale>('1');
  const [variant, setVariant] = useState<HardwareVariant>('dual');

  const visibleItems = useMemo(
    () => BOM_COMPONENTS.filter((item) => variant === 'dual' || !item.requiresGsm),
    [variant]
  );

  const totalCost = useMemo(
    () => visibleItems.reduce((sum, item) => sum + item.prices[scale], 0),
    [visibleItems, scale]
  );

  return (
    <>
      {/* BOM & Market Economics */}
      <section id="bom" className="bg-slate-50 border-b border-slate-200 py-14 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-medium text-slate-500">
                03. Bill of Materials &amp; Unit Economics
              </p>
              <h2 className="mt-2 font-display text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                Engineered Under ₹600–₹1,000 for Mass Adoption
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                Compare single-unit student prototype pricing against bulk manufacturing tiers and
                existing ₹3,000–₹5,000+ commercial smart gas alarms.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg">
                {(
                  [
                    { id: 'dual', label: 'Wi-Fi + SIM800L GSM' },
                    { id: 'wifi', label: 'Wi-Fi Only' },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariant(v.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      variant === v.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg">
                {(
                  [
                    { id: '1', label: '1 Unit' },
                    { id: '100', label: '100 Units' },
                    { id: '1000', label: '1,000 Units' },
                  ] as const
                ).map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setScale(tier.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      scale === tier.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* BOM Table */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Component Cost Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    {variant === 'dual'
                      ? 'Full Rural + Urban Edition (Wi-Fi + Offline SIM800L GSM)'
                      : 'Urban Wi-Fi Edition (Uses Home Router)'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500">Total Unit BOM</p>
                  <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    ₹{totalCost}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                      <th className="py-3 px-6">Subsystem Component</th>
                      <th className="py-3 px-6 text-right">Unit Cost (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {visibleItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-6">
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.spec}</p>
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                          ₹{item.prices[scale]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200">
                      <td className="py-4 px-6 text-sm font-bold text-slate-900">
                        Total Hardware Cost ({scale === '1' ? 'Prototype' : `${scale}-Unit Batch`})
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-lg font-bold text-slate-900 tabular-nums">
                        ₹{totalCost}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Market Comparison */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-display text-base font-bold text-slate-900">
                  Why Existing Smart Detectors Fall Short
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Project #87 vs ₹3,000–₹5,000+ imported smart gas monitors
                </p>
              </div>

              <div className="divide-y divide-slate-200">
                {COMPARISON_ROWS.map((row) => (
                  <div key={row.feature} className="p-5">
                    <p className="text-xs font-semibold text-slate-900">{row.feature}</p>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <p className="text-[11px] font-medium text-slate-500">Project #87</p>
                        <p className="mt-0.5 font-semibold text-slate-900">{row.project87}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <p className="text-[11px] font-medium text-slate-500">Commercial Units</p>
                        <p className="mt-0.5 text-slate-600">{row.commercial}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">{row.advantage}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grassroots Impact Section */}
      <section id="impact" className="bg-white border-b border-slate-200 py-14 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6">
              <div className="h-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col">
                <div className="flex-1 min-h-[280px] overflow-hidden">
                  <ResilientImage
                    src={ASSETS.ruralKitchen}
                    alt="Rural Indian Anganwadi community kitchen using domestic LPG cylinders in daily meal preparation"
                    fallbackTitle="Rural & Community Kitchen Deployment"
                    fallbackSubtitle="Designed for rural households, Anganwadis, and small eateries."
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-4 py-3 bg-white border-t border-slate-200 text-xs text-slate-600">
                  Target Deployment: Rural Households, Anganwadi Kitchens &amp; Small Eateries
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-medium text-slate-500">
                04. Grassroots Scalability &amp; RAHI Fit
              </p>
              <h2 className="mt-2 font-display text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                Built for Real Indian Kitchens, Not Lab Idealism
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                LPG cylinder adoption under national clean-cooking initiatives now reaches millions
                of rural and semi-urban families—yet domestic leak protection remains virtually absent
                because commercial smart alarms assume expensive budgets and uninterrupted home Wi-Fi.
              </p>

              <div className="mt-6 space-y-5 pt-6 border-t border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    01. Rural &amp; PMUY Households
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Plug-and-play 3-pin form factor works beside any 14.2 kg cylinder without
                    drilling walls or needing broadband—delivering plain SMS/call alerts to basic
                    mobile phones.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    02. Anganwadi &amp; Mid-Day Meal Kitchens
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Protects high-occupancy community cooking spaces with an unmistakable 85dB
                    local siren and automatic wardens/supervisor GSM notification during overnight
                    slow leaks.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    03. Roadside Dhabas &amp; Small Eateries
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Supports optional servo/solenoid cylinder regulator auto-shutoff to isolate leaks
                    automatically after closing hours when no staff are present on site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
