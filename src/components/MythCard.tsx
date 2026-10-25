import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Compass, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { loadMythCard, type MythCardData, type SimilarTale } from '../api/client';

interface MythCardProps {
  taleId: string;
  /** Shown while the card loads, before the server answers. */
  title: string;
  onBack: () => void;
  backLabel?: string;
  /** Open another tale's card from the similar-tales lists. */
  onOpenTale: (tale: { id: string; title: string }) => void;
  /** Only for tales that are on the globe. */
  onFocusOnGlobe?: () => void;
}

// A card that pops out of the search results: the dataset record, a short summary written from the
// sources, then the sources found by searching for this specific tale.
export const MythCard: React.FC<MythCardProps> = ({ taleId, title, onBack, backLabel = 'Back to results', onOpenTale, onFocusOnGlobe }) => {
  const [card, setCard] = useState<MythCardData | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    setCard(null);
    loadMythCard(taleId).then((c) => {
      if (cancelled) return;
      setCard(c);
      setState(c ? 'ready' : 'failed');
    });
    return () => {
      cancelled = true;
    };
  }, [taleId]);

  const rec = card?.record;
  const facts: Array<[string, string]> = rec
    ? ([
        ['Place', rec.place ?? rec.provenance ?? ''],
        ['Tradition', rec.tradition ?? ''],
        ['Tale type', rec.atuType ? `ATU ${rec.atuType}${rec.atuName ? ` · ${rec.atuName}` : ''}` : ''],
        ['Dataset citation', rec.citation ?? '']
      ] as Array<[string, string]>).filter(([, v]) => v)
    : [];

  const TaleButton = ({ tale, note }: { tale: SimilarTale; note?: string }) => (
    <li>
      <button
        onClick={() => onOpenTale({ id: tale.id, title: tale.title })}
        className="w-full text-left p-2.5 rounded-lg bg-[#142033]/80 hover:bg-[#1A2A42] border border-[#D6B36B]/25 hover:border-[#D6B36B] transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-serif font-bold text-[#FFF7E8] leading-snug">{tale.title}</span>
          {tale.tier === 'curated' && (
            <span className="shrink-0 text-[10px] font-sans font-semibold uppercase tracking-wide text-[#D6B36B]">Atlas</span>
          )}
        </div>
        <div className="text-[11px] font-sans text-[#F1E5CC]/70 mt-0.5 leading-snug">
          {[tale.place, note].filter(Boolean).join(' · ')}
        </div>
      </button>
    </li>
  );

  const sectionTitle = 'text-[11px] uppercase tracking-wider font-sans font-semibold text-[#D6B36B] mb-1.5';

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col rounded-xl bg-[#0E1726] border border-[#D6B36B] shadow-[0_18px_50px_rgba(0,0,0,0.85)] overflow-hidden"
      style={{ transformOrigin: 'top center' }}
      initial={{ opacity: 0, y: -18, scaleY: 0.9 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#D6B36B]/30 bg-[#142033]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#D6B36B] hover:text-[#FFF7E8] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </button>
        {onFocusOnGlobe && (
          <button
            onClick={onFocusOnGlobe}
            className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#D6B36B] hover:text-[#FFF7E8] cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Focus on globe</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
        <header>
          <div className="text-[11px] uppercase tracking-wider font-sans font-semibold text-[#D6B36B]">
            {rec ? (rec.tier === 'curated' ? 'Atlas story' : 'Folktale library · metadata only') : 'Loading'}
          </div>
          <h4 className="font-serif font-bold text-xl text-[#FFF7E8] leading-snug mt-0.5">{rec?.title ?? title}</h4>
          {rec?.originalTitle && (
            <div className="text-xs font-serif italic text-[#F1E5CC]/75 mt-0.5">{rec.originalTitle}</div>
          )}
        </header>

        {state === 'loading' && (
          <div className="flex items-center gap-2 text-xs font-sans text-[#F1E5CC]/80 py-4">
            <Loader2 className="w-4 h-4 animate-spin text-[#D6B36B]" />
            <span>Searching for this tale and writing a summary…</span>
          </div>
        )}

        {state === 'failed' && (
          <p className="text-xs font-sans text-[#F1E5CC]/80 leading-relaxed">
            The card could not be loaded. Check that the backend is running, then go back and try again.
          </p>
        )}

        {card && (
          <>
            {facts.length > 0 && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs font-sans">
                {facts.map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt className="text-[#D6B36B]/90 font-semibold">{k}</dt>
                    <dd className="text-[#F1E5CC]/90 leading-snug">{v}</dd>
                  </React.Fragment>
                ))}
              </dl>
            )}

            <section>
              <h5 className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-sans font-semibold text-[#D6B36B] mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Summary</span>
              </h5>
              {card.summary.available ? (
                <>
                  <p className="text-sm font-serif text-[#FFF7E8] leading-relaxed">{card.summary.text}</p>
                  <p className="text-[11px] font-sans text-[#F1E5CC]/60 mt-1.5 leading-snug">
                    Written by an AI model ({card.summary.model}) from the dataset record and the sources below. It can
                    contain mistakes; check the sources.
                  </p>
                </>
              ) : (
                <p className="text-xs font-sans text-[#F1E5CC]/70 leading-relaxed">
                  No summary is available ({card.summary.reason}).
                </p>
              )}
            </section>

            {card.typeMotifs && (
              <section>
                <h5 className={sectionTitle}>Motifs listed for tale type {card.typeMotifs.atuType}</h5>
                <div className="flex flex-wrap gap-1.5">
                  {card.typeMotifs.motifs.map((m) => (
                    <span
                      key={m.id}
                      title={m.id}
                      className="px-2.5 py-1 rounded-full border border-[#D6B36B]/50 bg-[#D6B36B]/10 text-[11px] font-sans text-[#FFF7E8] leading-snug"
                    >
                      {m.name ?? m.id}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] font-sans text-[#F1E5CC]/60 mt-1.5 leading-snug">
                  {card.typeMotifs.shown < card.typeMotifs.total
                    ? `Showing ${card.typeMotifs.shown} of ${card.typeMotifs.total} motifs. `
                    : ''}
                  {card.typeMotifs.note} From Thompson’s Motif-Index via the trilogy dataset.
                </p>
              </section>
            )}

            {card.similar && (
              <section className="space-y-3">
                <h5 className={sectionTitle}>Similar tales</h5>
                {card.similar.typeNote && (
                  <p className="text-[11px] font-sans text-[#F1E5CC]/70 leading-snug">{card.similar.typeNote}</p>
                )}

                {card.similar.sameType.length > 0 && (
                  <div>
                    <div className="text-xs font-serif italic text-[#E7CCA0] mb-1.5">
                      Same tale type ({card.similar.sameType.length} of {card.similar.sameTypeTotal})
                    </div>
                    <ul className="space-y-1.5 list-none p-0 m-0">
                      {card.similar.sameType.map((t) => (
                        <TaleButton key={t.id} tale={t} note={t.atuType ? `ATU ${t.atuType}` : undefined} />
                      ))}
                    </ul>
                  </div>
                )}

                {card.similar.atlas.length > 0 && (
                  <div>
                    <div className="text-xs font-serif italic text-[#E7CCA0] mb-1.5">In the atlas</div>
                    <ul className="space-y-1.5 list-none p-0 m-0">
                      {card.similar.atlas.map((a) => (
                        <TaleButton key={a.id} tale={a} note={a.reason} />
                      ))}
                    </ul>
                  </div>
                )}

                {card.similar.nearbyTypes.length > 0 && (
                  <div>
                    <div className="text-xs font-serif italic text-[#E7CCA0] mb-1.5">Nearby tale types</div>
                    <ul className="space-y-2 list-none p-0 m-0">
                      {card.similar.nearbyTypes.map((n) => (
                        <li key={n.atuType} className="p-2.5 rounded-lg border border-[#D6B36B]/20">
                          <div className="text-[11px] font-sans text-[#FFF7E8] leading-snug">
                            <strong>ATU {n.atuType}</strong>
                            {n.atuName ? ` · ${n.atuName}` : ''}
                          </div>
                          <div className="text-[11px] font-sans text-[#F1E5CC]/65 mb-1.5 leading-snug">
                            {n.why}
                            {n.sharedMotifs.length > 0 &&
                              `: ${n.sharedMotifs.map((m) => m.name ?? m.id).join(', ')}`}
                          </div>
                          <ul className="space-y-1.5 list-none p-0 m-0">
                            {n.examples.map((t) => (
                              <TaleButton key={t.id} tale={t} />
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-[11px] font-sans text-[#F1E5CC]/55 leading-snug">{card.similar.basis}</p>
              </section>
            )}

            <section>
              <h5 className="text-[11px] uppercase tracking-wider font-sans font-semibold text-[#D6B36B] mb-1.5">
                Sources on this tale
                {card.sources.source !== 'none' && (
                  <span className="ml-2 normal-case tracking-normal font-normal text-[#F1E5CC]/60">
                    {card.sources.source === 'live' ? 'searched just now' : 'saved from an earlier search'}
                  </span>
                )}
              </h5>
              {card.sources.results.length === 0 ? (
                <p className="text-xs font-sans text-[#F1E5CC]/70 leading-relaxed">
                  No reputable source was found for this tale.
                </p>
              ) : (
                <ul className="space-y-2 list-none p-0 m-0">
                  {card.sources.results.map((r) => (
                    <li key={r.url} className="p-2.5 rounded-lg bg-[#142033]/80 border border-[#D6B36B]/25">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start justify-between gap-2 text-xs font-sans font-semibold text-[#FFF7E8] hover:text-[#D6B36B]"
                      >
                        <span className="leading-snug">{r.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      </a>
                      <div className="text-[11px] font-sans text-[#D6B36B]/80 mt-0.5">{r.domain}</div>
                      {r.snippet && (
                        <p className="text-[11px] font-sans text-[#F1E5CC]/75 mt-1 leading-snug">{r.snippet}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <p className="text-[11px] font-sans text-[#F1E5CC]/55 leading-snug">
              Similar motifs across tales are not evidence that one tale borrowed from another. Nothing here has been
              checked by the atlas team.
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
};
