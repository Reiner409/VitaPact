import { Group, Text } from '@mantine/core';
import { tokens } from '../../tokens';
import { BandDot } from '../BandDot';
import type { ScoreBand } from '../scoreBand';

export interface VerdictLabelProps {
  band: ScoreBand;
  /** The translated, encouraging verdict of the band (section 9). */
  children: string;
}

/** The verdict of a score band; text stays dark on every band (RF-15, G4.3). */
export function VerdictLabel({ band, children }: VerdictLabelProps) {
  return (
    <Group gap="xs" wrap="nowrap" justify="center">
      <BandDot band={band} />
      <Text
        component="span"
        data-band={band}
        fw={tokens.font.weight.semibold}
        style={{ color: 'var(--vp-color-text)' }}
      >
        {children}
      </Text>
    </Group>
  );
}
