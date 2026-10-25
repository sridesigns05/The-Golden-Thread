import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { toBlob } from 'html-to-image';
import { Check, Copy, Download, Share2, X } from 'lucide-react';
import { GoldenThreadPassport, PASSPORT_HEIGHT, PASSPORT_WIDTH } from './GoldenThreadPassport';
import type { PassportData } from '../types/passport';

interface PassportModalProps {
  data: PassportData;
  onClose: () => void;
}

// Room kept around the card for the modal's own padding and its button row.
const CHROME_H = 150;
const EXPORT_SCALE = 1.5; // 900 x 1200 layout, saved as a 1350 x 1800 image (the paper grain makes larger files heavy)

async function waitForAssets(node: HTMLElement) {
  try {
    await document.fonts.load('700 40px "Cormorant Garamond"');
    await document.fonts.load('italic 600 24px "Cormorant Garamond"');
    await document.fonts.load('500 18px "DM Sans"');
    await document.fonts.ready;
  } catch {
    // Fonts API missing: the export falls back to the system fonts
  }
  await Promise.all(
    Array.from(node.querySelectorAll('img')).map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          })
    )
  );
}

export const PassportModal: React.FC<PassportModalProps> = ({ data, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [busy, setBusy] = useState<'download' | 'share' | null>(null);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  // The PNG is made as soon as the passport opens, so Share and Download answer instantly. Some phones only
  // allow sharing within a moment of the tap, which a slow render would use up.
  const readyBlob = useRef<Blob | null>(null);

  // Fit the preview to the window; the exported image always uses the full-size layout.
  useEffect(() => {
    const fit = () => {
      const w = Math.min(window.innerWidth * 0.92, 640);
      const h = window.innerHeight * 0.85 - CHROME_H;
      setScale(Math.max(0.2, Math.min(1, w / PASSPORT_WIDTH, h / PASSPORT_HEIGHT)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const fileName = data.variant === 'solo' ? 'explorers-passport.png' : 'friendship-passport.png';

  const render = useCallback(async (): Promise<Blob> => {
    const node = cardRef.current;
    if (!node) throw new Error('The passport is not on screen yet.');
    await waitForAssets(node);
    const blob = await toBlob(node, {
      width: PASSPORT_WIDTH,
      height: PASSPORT_HEIGHT,
      pixelRatio: EXPORT_SCALE,
      cacheBust: true,
      backgroundColor: '#F1E4C6',
      style: { transform: 'none' }
    });
    if (!blob) throw new Error('The image could not be created.');
    return blob;
  }, []);

  useEffect(() => {
    let cancelled = false;
    readyBlob.current = null;
    const t = setTimeout(() => {
      render()
        .then((blob) => {
          if (!cancelled) readyBlob.current = blob;
        })
        .catch(() => {
          // The buttons try again on click and report the error then
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [render]);

  const saveBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const handleDownload = async () => {
    setBusy('download');
    setNotice(null);
    try {
      saveBlob(readyBlob.current ?? (await render()));
      setNotice({ kind: 'ok', text: 'Passport saved as a PNG.' });
    } catch (e) {
      setNotice({ kind: 'error', text: `Could not save the passport. ${e instanceof Error ? e.message : ''}`.trim() });
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    setBusy('share');
    setNotice(null);
    try {
      const blob = readyBlob.current ?? (await render());
      const file = new File([blob], fileName, { type: 'image/png' });
      if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'My Golden Thread Passport' });
          setNotice({ kind: 'ok', text: 'Shared.' });
        } catch (e) {
          // Closing the share sheet is not an error
          if (e instanceof DOMException && e.name === 'AbortError') {
            // Closing the share sheet is not an error
          } else if (e instanceof DOMException && e.name === 'NotAllowedError') {
            // The browser refused (for example the tap was too long ago): save the image instead
            saveBlob(blob);
            setNotice({ kind: 'ok', text: 'Your browser did not allow sharing right now, so the PNG was saved instead.' });
          } else {
            throw e;
          }
        }
      } else {
        // This device cannot share an image, so save it instead
        saveBlob(blob);
        setNotice({
          kind: 'ok',
          text:
            data.variant === 'shared' && data.shareUrl
              ? 'Sharing images is not supported here, so the PNG was saved. You can also copy the journey link.'
              : 'Sharing images is not supported here, so the PNG was saved.'
        });
      }
    } catch (e) {
      setNotice({ kind: 'error', text: `Could not share the passport. ${e instanceof Error ? e.message : ''}`.trim() });
    } finally {
      setBusy(null);
    }
  };

  const shareUrl = data.variant === 'shared' ? data.shareUrl : undefined;
  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setNotice({ kind: 'error', text: 'Could not copy the link. Select it from the address you shared instead.' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label={data.variant === 'solo' ? "Explorer's Passport" : 'Friendship Passport'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="relative flex flex-col items-center gap-3 max-h-[92vh] max-w-full overflow-y-auto"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Preview: the card is laid out at full size and scaled down for the screen */}
        <div
          className="shrink-0 rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
          style={{ width: PASSPORT_WIDTH * scale, height: PASSPORT_HEIGHT * scale }}
        >
          <div style={{ width: PASSPORT_WIDTH, height: PASSPORT_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <GoldenThreadPassport ref={cardRef} data={data} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button onClick={handleDownload} disabled={busy !== null} className="btn btn-gold">
            <Download className="w-4 h-4" />
            <span>{busy === 'download' ? 'Preparing…' : 'Download Passport'}</span>
          </button>
          <button onClick={handleShare} disabled={busy !== null} className="btn btn-dark">
            <Share2 className="w-4 h-4 text-[#D6B36B]" />
            <span>{busy === 'share' ? 'Preparing…' : 'Share Passport'}</span>
          </button>
          {shareUrl && (
            <button onClick={handleCopyLink} className="btn btn-dark">
              {copied ? <Check className="w-4 h-4 text-[#D6B36B]" /> : <Copy className="w-4 h-4 text-[#D6B36B]" />}
              <span>{copied ? 'Link copied' : 'Copy Journey Link'}</span>
            </button>
          )}
          <button onClick={onClose} className="btn btn-ghost" style={{ color: '#E7CCA0', borderColor: 'rgba(231,204,160,0.5)' }}>
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {notice && (
          <p
            role="status"
            className={`text-xs font-sans text-center max-w-[520px] ${notice.kind === 'error' ? 'text-red-300' : 'text-[#E7CCA0]'}`}
          >
            {notice.text}
          </p>
        )}
      </motion.div>
    </div>
  );
};
