/** Stays here until platform offers a clipboard function; the screen receives it as a prop. */
export const copyToClipboard = (text: string): Promise<void> => navigator.clipboard.writeText(text);
