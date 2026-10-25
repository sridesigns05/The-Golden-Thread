import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { StoryId, MotifId } from '../types';
import { Evidence, loadEvidence } from '../api/client';

interface EvidencePanelProps {
  storyA: StoryId;
  storyB: StoryId;
  motif: MotifId;
}

const MAX_SHOWN = 4;

// Web sources for a comparison: search results (via SerpApi) from an allowlist of reputable domains,
// served live or from a cache the backend prepared in advance. Snippets are excerpts from the
// search engine, not verified claims.
export const EvidencePanel: React.FC<EvidencePanelProps> = ({ storyA, storyB, motif }) => {
  const [evidence, setEvidence] = useState<Evidence | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEvidence(null);
    loadEvidence(storyA, storyB, motif).then((e) => {
      if (!cancelled) setEvidence(e);
    });
    return () => {
      cancelled = true;
    };
  }, [storyA, storyB, motif]);

  if (!evidence) {
    return <div className="text-[11px] font-sans text-[#19372F]/60 italic">Looking for sources…</div>;
  }
  if (evidence.results.length === 0) {
    return (
      <div className="text-[11px] font-sans text-[#19372F]/60 italic">
        No web sources are available for this pair right now.
      </div>
    );
  }

  return (
    <div className="p-2.5 rounded-lg bg-[#FAF5EA] border border-[#D6B36B]/40 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-sans uppercase font-bold text-[#8A6726] tracking-wider">
          Sources to read next
        </div>
        <span className="text-[10px] font-sans text-[#19372F]/60">
          {evidence.source === 'live' ? 'live search' : 'saved search'} · reputable domains only
        </span>
      </div>
      <ul className="space-y-1.5">
        {evidence.results.slice(0, MAX_SHOWN).map((item) => (
          <li key={item.url} className="text-xs font-sans leading-snug text-[#19372F]/85">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#19372F] hover:text-[#8A6726] underline decoration-[#D6B36B]/60 inline-flex items-center gap-1"
            >
              {item.title || item.domain}
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
            <span className="text-[#19372F]/55"> · {item.domain}</span>
            {item.snippet && <div className="text-[11px] text-[#19372F]/70 line-clamp-2">{item.snippet}</div>}
          </li>
        ))}
      </ul>
      <div className="text-[10px] font-sans text-[#19372F]/55">
        Search excerpts, not verified claims. Open the source to check.
      </div>
    </div>
  );
};
