import { tokens } from '../tokens';
import { bandColor, type ScoreBand } from './scoreBand';

/** The dot coloured by score band; `null` draws an empty dot for a day not logged. */
export function BandDot({ band }: { band: ScoreBand | null }) {
  const size = tokens.space[3];
  return (
    <span
      aria-hidden="true"
      data-band={band ?? 'none'}
      style={{
        display: 'inline-block',
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${tokens.border.width}px solid var(--vp-color-primary-strong)`,
        backgroundColor: band ? bandColor[band] : 'var(--vp-color-surface)',
      }}
    />
  );
}
