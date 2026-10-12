import { Group, Stack, Text } from '@mantine/core';
import { AppIcon, type IconName } from '../../icons/AppIcon';
import { tokens } from '../../tokens';
import { Card, type CardAccent } from '../Card/Card';
import { accentColor, pillarLook } from '../pillarLook';
import { PillarField, type PillarCardText } from './PillarField';
import {
  isAsked,
  type PillarCardPillar,
  type PillarCardValues,
  type PillarFieldValue,
} from './pillarShape';

export interface PillarCardProps {
  /** A pillar from the pillar module; its fields decide what the card asks (RF-23). */
  pillar: PillarCardPillar;
  /** Translated pillar name. */
  title: string;
  text: PillarCardText;
  values: PillarCardValues;
  onChange: (field: string, value: PillarFieldValue | undefined) => void;
  /** Translated errors by field key. */
  errors?: Readonly<Record<string, string>>;
  /** The card turns green with this message once the day's goal is reached (section 5.2). */
  goalReachedLabel?: string;
}

/** A pillar's card: its icon and colour, and one field per field of the pillar module. */
export function PillarCard({
  pillar,
  title,
  text,
  values,
  onChange,
  errors = {},
  goalReachedLabel,
}: PillarCardProps) {
  const { accent, icon } = pillarLook(pillar);
  const goalReached = goalReachedLabel !== undefined;
  return (
    <Card accent={accent} {...(goalReached ? { tone: 'soft' } : {})}>
      <section aria-label={title}>
        <Stack gap="md">
          <PillarHeading accent={accent} icon={icon} title={title} />
          {pillar.fields
            .filter((field) => isAsked(field, values))
            .map((field) => (
              <PillarField
                key={field.key}
                field={field}
                value={values[field.key]}
                text={text}
                error={errors[field.key]}
                onChange={(value) => onChange(field.key, value)}
              />
            ))}
          {goalReached && <GoalReached label={goalReachedLabel} />}
        </Stack>
      </section>
    </Card>
  );
}

function PillarHeading({
  accent,
  icon,
  title,
}: {
  accent: CardAccent;
  icon: IconName;
  title: string;
}) {
  return (
    <Group gap="xs" wrap="nowrap">
      <span style={{ color: accentColor(accent), display: 'inline-flex' }}>
        <AppIcon name={icon} />
      </span>
      <Text component="h3" m={0} fz={tokens.font.h2.size} fw={tokens.font.h2.weight}>
        {title}
      </Text>
    </Group>
  );
}

function GoalReached({ label }: { label: string }) {
  return (
    <Group gap="xs" wrap="nowrap">
      <AppIcon name="success" />
      <Text fw={tokens.font.weight.semibold} style={{ color: 'var(--vp-color-text)' }}>
        {label}
      </Text>
    </Group>
  );
}
