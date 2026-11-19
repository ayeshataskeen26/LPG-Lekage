import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { ASSETS, PITCH_COPY } from '../data/projectData';

export function PitchKitSection() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 2000);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  const cards = [
    {
      id: 'summary',
      title: 'RAHI Project Pitch Summary',
      subtitle: 'Submission-ready problem statement, cost positioning, and impact narrative',
      content: PITCH_COPY.summary,
    },
    {
      id: 'imagePrompt',
      title: 'Product Photography Prompt',
      subtitle: 'For generating pitch deck & poster visuals of the socket-mounted detector',
      content: PITCH_COPY.imagePrompt,
    },
    {
      id: 'diagramPrompt',
      title: 'System Block Diagram Prompt',
      subtitle: 'For technical architecture slides covering MQ-6, ESP32, Alarm & GSM branches',
      content: PITCH_COPY.diagramPrompt,
    },
  ];

  return (
    <section id="pitch-kit" className="bg-slate-50 py-14 lg:py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-slate-500">
              05. IIT Ropar RAHI Submission Kit
            </p>
            <h2 className="mt-2 font-display text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Ready-to-Use Slide Assets &amp; Prompts
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Download the generated high-resolution product photo and technical block diagram, or
              copy the formatted pitch narrative and slide prompts directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={ASSETS.productPhoto}
              download="project-87-product-photo.jpg"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Download Product Photo</span>
            </a>
            <a
              href={ASSETS.blockDiagram}
              download="project-87-block-diagram.jpg"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:border-slate-400 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Download Block Diagram</span>
            </a>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const isCopied = copiedKey === card.id;
            return (
              <div
                key={card.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
                    </div>
                  </div>
                  <pre className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-sans max-h-56 overflow-y-auto">
                    {card.content}
                  </pre>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void handleCopy(card.id, card.content)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                        <span>Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
