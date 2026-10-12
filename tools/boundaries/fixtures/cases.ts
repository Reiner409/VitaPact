/**
 * One forbidden import per boundary rule (F1-06). Each case is linted as if it lived at `file`;
 * boundaries.test.ts checks that ESLint reports it, and that the matching allowed import passes.
 */
export const forbiddenImports = [
  {
    rule: 'Mantine only in shared/ui',
    file: 'screens/today/src/Bad.tsx',
    code: "import { Button } from '@mantine/core';",
  },
  {
    rule: 'Lucide only in shared/ui',
    file: 'screens/week/src/Bad.tsx',
    code: "import { Sun } from 'lucide-react';",
  },
  {
    rule: 'i18next only in shared/i18n',
    file: 'screens/friends/src/Bad.tsx',
    code: "import { useTranslation } from 'react-i18next';",
  },
  {
    rule: 'Tauri only in platform',
    file: 'core/src/report/bad.ts',
    code: "import { save } from '@tauri-apps/plugin-dialog';",
  },
  {
    rule: 'no deep import into src',
    file: 'screens/today/src/Bad.tsx',
    code: "import { tokens } from '@vitapact/ui/src/tokens';",
  },
  {
    rule: 'no import of the app',
    file: 'shared/ui/src/bad.ts',
    code: "import { App } from '@vitapact/app';",
  },
  {
    rule: 'no screen imports another screen',
    file: 'screens/today/src/Bad.tsx',
    code: "import { WeekScreen } from '@vitapact/screen-week';",
  },
  {
    rule: 'no relative import out of the package',
    file: 'screens/today/src/Bad.tsx',
    code: "import { WeekScreen } from '../../week/src/WeekScreen';",
  },
  {
    rule: 'screens do not use Dexie',
    file: 'screens/noteboard/src/bad.ts',
    code: "import Dexie from 'dexie';",
  },
  {
    rule: 'shared does not import screens',
    file: 'shared/ui/src/bad.ts',
    code: "export * from '@vitapact/screen-today';",
  },
  {
    rule: 'shared/i18n does not import shared/ui',
    file: 'shared/i18n/src/bad.ts',
    code: "import { tokens } from '@vitapact/ui';",
  },
  {
    rule: 'core does not import platform',
    file: 'core/src/storage/bad.ts',
    code: "import { saveFile } from '@vitapact/platform';",
  },
  {
    rule: 'core does not import React',
    file: 'core/src/scoring/bad.ts',
    code: "import { useState } from 'react';",
  },
  {
    rule: 'platform depends on no VitaPact package',
    file: 'platform/src/bad.ts',
    code: "import { tokens } from '@vitapact/ui';",
  },
  {
    rule: 'core/report does not reach storage (RNF-02)',
    file: 'core/src/report/bad.ts',
    code: "import { db } from '@vitapact/core/storage';",
  },
  {
    rule: 'core/report does not reach storage through a relative path (RNF-02)',
    file: 'core/src/report/bad.ts',
    code: "import { db } from '../storage';",
  },
  {
    rule: 'core/report does not reach notes (RNF-02)',
    file: 'core/src/report/bad.ts',
    code: "import { decryptNote } from '../crypto/notes';",
  },
  {
    rule: 'core/report does not reach notes through the package entry point (RNF-02)',
    file: 'core/src/report/bad.ts',
    code: "import { decryptNote } from '@vitapact/core/crypto/notes';",
  },
  {
    rule: 'dynamic import is checked too',
    file: 'screens/today/src/bad.ts',
    code: "export const load = () => import('@mantine/core');",
  },
  {
    rule: 'Dexie only in core/storage',
    file: 'core/src/scoring/bad.ts',
    code: "import Dexie from 'dexie';",
  },
  {
    rule: 'QR libraries only in core/report',
    file: 'core/src/groups/bad.ts',
    code: "import jsQR from 'jsqr';",
  },
  {
    rule: 'Chart.js only in shared/ui',
    file: 'screens/week/src/bad.ts',
    code: "import { Chart } from 'chart.js';",
  },
];

export const allowedImports = [
  { file: 'core/src/report/ok.ts', code: "import QRCode from 'qrcode';" },
  { file: 'shared/ui/src/ok.ts', code: "import { Chart } from 'chart.js';" },
  { file: 'shared/ui/src/ok.tsx', code: "import { Button } from '@mantine/core';" },
  { file: 'shared/ui/src/ok.tsx', code: "import { Sun } from 'lucide-react';" },
  { file: 'shared/i18n/src/ok.ts', code: "import i18next from 'i18next';" },
  { file: 'platform/src/ok.ts', code: "import { save } from '@tauri-apps/plugin-dialog';" },
  { file: 'screens/today/src/ok.tsx', code: "import { PageHeader } from '@vitapact/ui';" },
  {
    file: 'screens/today/src/ok.tsx',
    code: "import { renderWithProviders } from '@vitapact/ui/testing';",
  },
  { file: 'screens/today/src/ok.tsx', code: "import en from '../locales/en/today.json';" },
  { file: 'screens/week/src/ok.ts', code: "import { saveFile } from '@vitapact/platform';" },
  { file: 'screens/week/src/ok.ts', code: "import { weekScore } from '@vitapact/core/scoring';" },
  {
    file: 'screens/noteboard/src/ok.ts',
    code: "import { decryptNote } from '@vitapact/core/crypto/notes';",
  },
  {
    file: 'screens/noteboard/src/ok.ts',
    code: "import { db } from '@vitapact/core/storage/notes';",
  },
  { file: 'core/src/report/ok.ts', code: "import { sign } from '../crypto';" },
  { file: 'core/src/storage/ok.ts', code: "import Dexie from 'dexie';" },
  {
    file: 'shared/ui/src/ok.tsx',
    code: "import type { Pillar } from '@vitapact/core/pillars';",
  },
  {
    file: 'shared/ui/src/ok.test.tsx',
    code: "import { hydrationPillar } from '@vitapact/core/pillars/testing';",
  },
  { file: 'app/src/ok.tsx', code: "import { TodayScreen } from '@vitapact/screen-today';" },
];
