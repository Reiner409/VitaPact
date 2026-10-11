import { Notification, Portal } from '@mantine/core';
import { useEffect } from 'react';
import { AppIcon } from '../../icons/AppIcon';
import { tokens } from '../../tokens';

export type ToastTone = 'success' | 'error';

export interface ToastProps {
  opened: boolean;
  tone: ToastTone;
  /** The translated message. */
  message: string;
  /** Translated name of the close button. */
  closeLabel: string;
  onClose: () => void;
}

const { bottomBarHeight } = tokens.layout;
const widthInsideGutters = `calc(100% - ${tokens.space[6]}px)`;

const looks: Record<ToastTone, { role: string; accent: string }> = {
  success: { role: 'status', accent: 'var(--vp-color-primary-strong)' },
  error: { role: 'alert', accent: 'var(--vp-color-danger)' },
};

/** Short confirmation at the bottom, above the bottom bar; it closes itself after 4 seconds. */
export function Toast({ opened, tone, message, closeLabel, onClose }: ToastProps) {
  useEffect(() => {
    if (!opened) return undefined;
    const timer = setTimeout(onClose, tokens.timing.toast);
    return () => clearTimeout(timer);
  }, [opened, onClose]);

  if (!opened) return null;
  const { role, accent } = looks[tone];
  return (
    <Portal>
      <Notification
        role={role}
        data-tone={tone}
        icon={<AppIcon name={tone} />}
        color={accent}
        withBorder
        radius="md"
        onClose={onClose}
        closeButtonProps={{ 'aria-label': closeLabel }}
        pos="fixed"
        bottom={bottomBarHeight + tokens.space[4]}
        left="50%"
        maw={tokens.layout.contentMaxWidth / 2}
        w={widthInsideGutters}
        style={{
          transform: 'translateX(-50%)',
          boxShadow: 'var(--vp-shadow-modal)',
          zIndex: 'var(--mantine-z-index-max)',
        }}
      >
        {message}
      </Notification>
    </Portal>
  );
}
