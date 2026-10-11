import { Modal as MantineModal } from '@mantine/core';
import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

export type ModalSize = 'small' | 'medium';

export interface ModalProps {
  opened: boolean;
  onClose: () => void;
  /** Translated title; it also names the dialog. */
  title: string;
  /** Translated name of the close button. */
  closeLabel: string;
  /** `small` for confirmations, `medium` for forms. */
  size?: ModalSize;
  children: ReactNode;
}

const mantineSize: Record<ModalSize, string> = { small: 'sm', medium: 'lg' };

export function Modal({
  opened,
  onClose,
  title,
  closeLabel,
  size = 'medium',
  children,
}: ModalProps) {
  return (
    <MantineModal
      opened={opened}
      onClose={onClose}
      title={title}
      size={mantineSize[size]}
      radius="lg"
      shadow="lg"
      centered
      closeButtonProps={{ 'aria-label': closeLabel }}
      transitionProps={{ duration: tokens.motion.base, timingFunction: tokens.motion.easing }}
      styles={{ title: { fontSize: tokens.font.h2.size, fontWeight: tokens.font.h2.weight } }}
    >
      {children}
    </MantineModal>
  );
}
