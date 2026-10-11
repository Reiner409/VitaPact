import { tokens } from '../tokens';

const { minTouchTarget } = tokens.layout;

/** Inline minimum size, so every clickable target is at least 44 × 44 px (G4.6). */
export const touchTarget = { minWidth: minTouchTarget, minHeight: minTouchTarget };
