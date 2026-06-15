import { createHighlighter, bundledLanguages, type Highlighter } from 'shiki';
import type { TokenizedLine } from './types.js';
import { THEMES, type Theme } from './themes.js';

let highlighterInstance: Highlighter | null = null;

async function getHighlighter(lang: string, theme: string): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: [theme],
      langs: [lang as any],
    });
  } else {
    const loadedLangs = highlighterInstance.getLoadedLanguages();
    if (!loadedLangs.includes(lang)) {
      await highlighterInstance.loadLanguage(lang as any);
    }
    const loadedThemes = highlighterInstance.getLoadedThemes();
    if (!loadedThemes.includes(theme)) {
      await highlighterInstance.loadTheme(theme as any);
    }
  }
  return highlighterInstance;
}

function isLanguageSupported(lang: string): boolean {
  return lang in bundledLanguages;
}

// Fallback: split code into lines of plain tokens (no syntax coloring)
function plainTokenize(code: string, defaultColor: string): TokenizedLine[] {
  return code.split('\n').map(line => [{ text: line, color: defaultColor }]);
}

export async function tokenizeCode(
  code: string,
  lang: string,
  theme: Theme = THEMES.dark,
): Promise<TokenizedLine[]> {
  // If the language is not supported by Shiki, fall back to plain text
  if (!isLanguageSupported(lang)) {
    return plainTokenize(code, theme.defaultColor);
  }

  try {
    const highlighter = await getHighlighter(lang, theme.shikiTheme);

    const result = highlighter.codeToTokensBase(code, {
      lang: lang as any,
      theme: theme.shikiTheme as any,
    });

    return result.map(line =>
      line.map(token => ({
        text: token.content,
        color: token.color || theme.defaultColor,
      }))
    );
  } catch {
    // If tokenization fails for any reason, fall back to plain text
    return plainTokenize(code, theme.defaultColor);
  }
}
