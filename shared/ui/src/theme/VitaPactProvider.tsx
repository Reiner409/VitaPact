import '@fontsource-variable/inter';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';
import { buildGlobalCss, tokens } from '../tokens';
import { vitaPactCssVariablesResolver, vitaPactTheme } from './theme';

const globalCss = buildGlobalCss(tokens);

export function VitaPactProvider({ children }: { children: ReactNode }) {
  return (
    <MantineProvider
      theme={vitaPactTheme}
      cssVariablesResolver={vitaPactCssVariablesResolver}
      forceColorScheme="light"
    >
      <style>{globalCss}</style>
      {children}
    </MantineProvider>
  );
}
