export type ThemeName = 'dark' | 'light';

export interface Theme {
  /** Shiki bundled theme used for syntax token colors. */
  shikiTheme: string;
  /** Fallback token color (plaintext / failed tokenization). */
  defaultColor: string;
  /** Editor background. */
  bg: string;
  /** Header (filename bar) background. */
  headerBg: string;
  /** Header bottom border. */
  headerBorder: string;
  /** Gutter line number color. */
  lineNumColor: string;
  /** Header filename text color. */
  headerTextColor: string;
  /** Gutter separator line color. */
  gutterSepColor: string;
  /** Soft-wrap continuation indicator (↳) color. */
  wrapIndicatorColor: string;
  /** Folded-region row background. */
  foldBg: string;
  /** Folded-region text color. */
  foldTextColor: string;
  /** Folded-region border color. */
  foldBorderColor: string;
  /** Annotation highlight colors. */
  highlight: {
    red: { bg: string; border: string };
    green: { bg: string; border: string };
  };
}

export const DEFAULT_THEME: ThemeName = 'dark';

export const THEMES: Record<ThemeName, Theme> = {
  // One Dark Pro — the original default.
  dark: {
    shikiTheme: 'one-dark-pro',
    defaultColor: '#abb2bf',
    bg: '#282c34',
    headerBg: '#21252b',
    headerBorder: '#181a1f',
    lineNumColor: '#636d83',
    headerTextColor: '#9da5b4',
    gutterSepColor: '#3b4048',
    wrapIndicatorColor: '#4b5263',
    foldBg: '#2c313a',
    foldTextColor: '#5c6370',
    foldBorderColor: '#3b4048',
    highlight: {
      red: { bg: 'rgba(255, 60, 60, 0.12)', border: '#ff4444' },
      green: { bg: 'rgba(60, 255, 60, 0.12)', border: '#44ff44' },
    },
  },
  // One Light — light counterpart.
  light: {
    shikiTheme: 'one-light',
    defaultColor: '#383a42',
    bg: '#fafafa',
    headerBg: '#eaeaeb',
    headerBorder: '#d3d3d6',
    lineNumColor: '#9d9d9f',
    headerTextColor: '#696c77',
    gutterSepColor: '#d3d3d6',
    wrapIndicatorColor: '#b5b5b8',
    foldBg: '#f0f0f1',
    foldTextColor: '#a0a1a7',
    foldBorderColor: '#d3d3d6',
    highlight: {
      red: { bg: 'rgba(228, 86, 73, 0.12)', border: '#e45649' },
      green: { bg: 'rgba(80, 161, 79, 0.14)', border: '#50a14f' },
    },
  },
};

export function resolveTheme(name?: string): Theme {
  if (name && name in THEMES) return THEMES[name as ThemeName];
  return THEMES[DEFAULT_THEME];
}
