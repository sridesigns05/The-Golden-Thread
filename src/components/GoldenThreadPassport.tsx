import React, { forwardRef } from 'react';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-700.css';
import '@fontsource/cormorant-garamond/latin-600-italic.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-700.css';
import { STORIES } from '../data/stories';
import { MOTIFS_CATALOG } from '../data/motifs';
import { getStoryVisual } from './StoryIllustrations';
import type { PassportData } from '../types/passport';
import type { StoryId } from '../types';

// The card is always laid out at this size, so the downloaded PNG looks the same on every device.
export const PASSPORT_WIDTH = 900;
export const PASSPORT_HEIGHT = 1200;

const INK = '#2B2A1E';
const FOREST = '#19372F';
const GOLD = '#B8902F';
const GOLD_SOFT = '#D6B36B';
// "Fairy Tale JF" is not bundled with the app, so the title falls back to Cormorant Garamond.
const HEADING = "'Fairy Tale JF', 'Cormorant Garamond', Georgia, serif";
const BODY = "'DM Sans', -apple-system, 'Segoe UI', sans-serif";

const MAX_STOPS = 5;

// Long titles get a smaller size so a row never grows taller than its slot.
function titleSize(title: string, big: number): number {
  return title.length > 44 ? 23 : title.length > 30 ? 26 : big;
}

function storyInfo(id: StoryId) {
  const s = STORIES.find((x) => x.id === id);
  return { title: s?.title ?? id, country: s?.country ?? '' };
}

function Thumb({ id, size }: { id: StoryId; size: number }) {
  const v = getStoryVisual(id);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${GOLD}`,
        boxShadow: `0 0 0 4px #F3E8CD, 0 0 0 5px ${GOLD_SOFT}`,
        background: '#EADBB8',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.42,
        flexShrink: 0
      }}
    >
      {v.src ? (
        <img src={v.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span>{v.symbol}</span>
      )}
    </div>
  );
}

function GlobeMotif() {
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
      <circle cx="38" cy="38" r="31" fill="none" stroke={GOLD} strokeWidth="1.6" />
      <ellipse cx="38" cy="38" rx="13" ry="31" fill="none" stroke={GOLD} strokeWidth="1" />
      <ellipse cx="38" cy="38" rx="25" ry="31" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.6" />
      <line x1="38" y1="7" x2="38" y2="69" stroke={GOLD} strokeWidth="0.8" />
      <ellipse cx="38" cy="38" rx="31" ry="11" fill="none" stroke={GOLD} strokeWidth="1" />
      <line x1="7" y1="38" x2="69" y2="38" stroke={GOLD} strokeWidth="0.8" />
      <path d="M12 52 C 28 40, 46 58, 64 24" fill="none" stroke={GOLD_SOFT} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="52" r="2.6" fill={GOLD} />
      <circle cx="64" cy="24" r="2.6" fill={GOLD} />
    </svg>
  );
}

function Rule() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: 520, margin: '0 auto' }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
      <div style={{ width: 9, height: 9, background: GOLD, transform: 'rotate(45deg)' }} />
      <div style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${GOLD})` }} />
    </div>
  );
}

function Seal({ line1, line2 }: { line1: string; line2: string }) {
  return (
    <div
      style={{
        width: 132,
        height: 132,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, #F1D98E, ${GOLD_SOFT} 55%, #A67C22)`,
        boxShadow: '0 2px 6px rgba(80,55,10,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: 112,
          height: 112,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,248,225,0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: FOREST,
          fontFamily: HEADING,
          fontWeight: 700,
          fontSize: 17,
          lineHeight: 1.15,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          textAlign: 'center'
        }}
      >
        <span style={{ fontSize: 16, marginBottom: 4 }}>✦</span>
        <span>{line1}</span>
        <span>{line2}</span>
      </div>
    </div>
  );
}

const label: React.CSSProperties = {
  fontFamily: BODY,
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: GOLD
};

// ---- Solo route -----------------------------------------------------------------------------------

function SoloRoute({ data }: { data: Extract<PassportData, { variant: 'solo' }> }) {
  const ids = data.visitedIds.length > 0 ? data.visitedIds : [data.startId, data.destinationId];
  const overflow = ids.length > MAX_STOPS;
  const shown = overflow ? [...ids.slice(0, MAX_STOPS - 1), ids[ids.length - 1]] : ids;
  const hidden = overflow ? ids.length - shown.length : 0;
  const rowH = shown.length <= 2 ? 150 : shown.length === 3 ? 125 : 100;
  const thumb = 64;
  const height = shown.length * rowH + (hidden ? 34 : 0);
  const cx = 74;
  const pts = shown.map((_, i) => ({
    x: cx + (i % 2 === 0 ? -18 : 18),
    y: i * rowH + rowH / 2 + (hidden && i >= shown.length - 1 ? 34 : 0)
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const my = (a.y + b.y) / 2;
    d += ` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
  }

  return (
    <div style={{ position: 'relative', width: 700, margin: '0 auto', height }}>
      <svg width="148" height={height} style={{ position: 'absolute', left: 0, top: 0 }} aria-hidden="true">
        <path d={d} fill="none" stroke={GOLD_SOFT} strokeWidth="6" opacity="0.35" strokeLinecap="round" />
        <path d={d} fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 0" />
      </svg>
      {shown.map((id, i) => {
        const info = storyInfo(id);
        const p = pts[i];
        const isEnd = i === 0 || i === shown.length - 1;
        return (
          <div
            key={`${id}-${i}`}
            style={{
              position: 'absolute',
              left: 0,
              top: p.y - rowH / 2,
              height: rowH,
              width: 700,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <div style={{ position: 'absolute', left: p.x - thumb / 2, top: rowH / 2 - thumb / 2 }}>
              <Thumb id={id} size={thumb} />
            </div>
            <div style={{ marginLeft: 164, minWidth: 0 }}>
              {isEnd && (
                <div style={{ ...label, fontSize: 12, marginBottom: 2 }}>
                  {i === 0 ? 'Departure' : 'Destination'}
                </div>
              )}
              <div
                style={{
                  fontFamily: HEADING,
                  fontWeight: 700,
                  fontSize: titleSize(info.title, isEnd ? 32 : 27),
                  lineHeight: 1.12,
                  color: FOREST
                }}
              >
                {info.title}
              </div>
              <div style={{ fontFamily: BODY, fontSize: 17, color: INK, opacity: 0.8, marginTop: 2 }}>
                {info.country}
              </div>
            </div>
          </div>
        );
      })}
      {hidden > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 164,
            top: (shown.length - 1) * rowH + 4,
            fontFamily: BODY,
            fontSize: 15,
            fontStyle: 'italic',
            color: INK,
            opacity: 0.7
          }}
        >
          {hidden} more {hidden === 1 ? 'story' : 'stories'} along the way
        </div>
      )}
    </div>
  );
}

function Stat({ value, caption }: { value: number; caption: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontFamily: HEADING, fontWeight: 700, fontSize: 52, lineHeight: 1, color: FOREST, fontVariantNumeric: 'lining-nums' }}>{value}</div>
      <div style={{ ...label, fontSize: 13, marginTop: 8, letterSpacing: '0.14em' }}>{caption}</div>
    </div>
  );
}

// ---- Shared pair ----------------------------------------------------------------------------------

function PairCard({ id, caption }: { id: StoryId; caption: string }) {
  const info = storyInfo(id);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, width: 640 }}>
      <Thumb id={id} size={128} />
      <div style={{ minWidth: 0 }}>
        <div style={{ ...label, fontSize: 13, marginBottom: 4 }}>{caption}</div>
        <div style={{ fontFamily: HEADING, fontWeight: 700, fontSize: titleSize(info.title, 36), lineHeight: 1.1, color: FOREST }}>
          {info.title}
        </div>
        <div style={{ fontFamily: BODY, fontSize: 19, color: INK, opacity: 0.8, marginTop: 4 }}>{info.country}</div>
      </div>
    </div>
  );
}

const MESSAGE_LIMIT = 150;
function shorten(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > MESSAGE_LIMIT ? `${t.slice(0, MESSAGE_LIMIT - 1).trimEnd()}…` : t;
}

// ---- The card -------------------------------------------------------------------------------------

export const GoldenThreadPassport = forwardRef<HTMLDivElement, { data: PassportData }>(({ data }, ref) => {
  const solo = data.variant === 'solo';
  const title = solo ? "THE EXPLORER'S PASSPORT" : 'THE FRIENDSHIP PASSPORT';
  const subtitle = solo ? 'A journey through stories.' : 'Two stories, one golden thread.';
  const footer = solo ? 'Every story leads somewhere.' : 'Different stories. A shared journey.';
  const motifNames =
    data.variant === 'shared'
      ? [...new Set(data.motifs)].map((m) => MOTIFS_CATALOG[m]?.name ?? m).slice(0, 6)
      : [];

  return (
    <div
      ref={ref}
      style={{
        width: PASSPORT_WIDTH,
        height: PASSPORT_HEIGHT,
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        backgroundColor: '#F1E4C6',
        backgroundImage: 'radial-gradient(ellipse at 50% 35%, #F8EFD8 0%, #F1E4C6 60%, #E6D4AC 100%)',
        color: INK,
        fontFamily: BODY
      }}
    >
      {/* Fine paper grain: an inline SVG layer, because background images are lost when the card is exported */}
      <svg width={PASSPORT_WIDTH} height={PASSPORT_HEIGHT} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <filter id="passport-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.15  0 0 0 0.09 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#passport-grain)" />
      </svg>

      {/* Antique gold borders */}
      <div style={{ position: 'absolute', inset: 22, border: `2px solid ${GOLD}`, borderRadius: 6 }} />
      <div style={{ position: 'absolute', inset: 32, border: `1px solid ${GOLD_SOFT}`, borderRadius: 3, opacity: 0.8 }} />

      <div
        style={{
          position: 'absolute',
          inset: 32,
          padding: '34px 48px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GlobeMotif />
          </div>
          <div
            style={{
              fontFamily: HEADING,
              fontWeight: 700,
              fontSize: 46,
              letterSpacing: '0.08em',
              lineHeight: 1.1,
              color: FOREST,
              marginTop: 10
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: HEADING,
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: 27,
              color: GOLD,
              margin: '8px 0 16px'
            }}
          >
            {subtitle}
          </div>
          <Rule />
        </div>

        {/* Body */}
        {data.variant === 'solo' ? (
          <>
            <SoloRoute data={data} />
            <div style={{ display: 'flex', width: 700, padding: '14px 0', borderTop: `1px solid ${GOLD_SOFT}`, borderBottom: `1px solid ${GOLD_SOFT}` }}>
              <Stat value={data.threadsWoven} caption="Golden Threads" />
              <Stat value={data.moves} caption="Moves" />
              <Stat value={data.shortestMoves} caption="Shortest Possible" />
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              <PairCard id={data.playerAStoryId} caption="First traveler's story" />
              <svg width="120" height="84" viewBox="0 0 120 84" aria-hidden="true" style={{ marginLeft: -520 }}>
                <path d="M60 0 C 28 24, 92 58, 60 84" fill="none" stroke={GOLD_SOFT} strokeWidth="6" opacity="0.35" strokeLinecap="round" />
                <path d="M60 0 C 28 24, 92 58, 60 84" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
                <circle cx="52" cy="42" r="4" fill={GOLD} />
              </svg>
              <PairCard id={data.playerBStoryId} caption="Second traveler's story" />
            </div>

            <div style={{ width: 700, textAlign: 'center' }}>
              <div style={{ ...label, marginBottom: 12 }}>Shared motifs discovered</div>
              {motifNames.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                  {motifNames.map((n) => (
                    <span
                      key={n}
                      style={{
                        padding: '7px 16px',
                        border: `1px solid ${GOLD}`,
                        borderRadius: 999,
                        fontSize: 18,
                        fontWeight: 500,
                        color: FOREST,
                        background: 'rgba(214,179,107,0.14)'
                      }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 17, opacity: 0.7, fontStyle: 'italic' }}>None recorded for this journey.</div>
              )}
            </div>

            {data.messages.length > 0 && (
              <div style={{ width: 640, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.messages.map((m) => (
                  <div
                    key={m.from}
                    style={{
                      fontFamily: HEADING,
                      fontStyle: 'italic',
                      fontWeight: 600,
                      fontSize: 22,
                      lineHeight: 1.3,
                      textAlign: 'center',
                      color: INK
                    }}
                  >
                    “{shorten(m.text)}”
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Seal + footer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {solo ? <Seal line1="Journey" line2="Complete" /> : <Seal line1="Stories" line2="Connected" />}
          <div style={{ fontFamily: HEADING, fontStyle: 'italic', fontWeight: 600, fontSize: 23, color: FOREST }}>
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
});
GoldenThreadPassport.displayName = 'GoldenThreadPassport';
