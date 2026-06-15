#!/usr/bin/env node

import { Command, Option, InvalidArgumentError } from 'commander';
import { parseLineRange, parseHighlightSpecs, parseLineRanges } from './parser.js';
import { generateCodeShot } from './pipeline.js';
import type { HighlightSpec } from './types.js';

/** Accumulate repeated flags. Each value may itself be a comma-separated list. */
function collect(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}

function parseNonNegativeInt(value: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new InvalidArgumentError('expected a non-negative integer.');
  }
  return n;
}

function parsePositiveInt(value: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new InvalidArgumentError('expected a positive integer (pixels).');
  }
  return n;
}

const program = new Command();

program
  .name('snipshot')
  .description('Generate a PNG screenshot of a code snippet, with syntax highlighting,\nline numbers, optional red/green annotations and folded regions.')
  .version('1.0.4')
  .argument('<file>', 'source file to screenshot (language auto-detected from its extension)')
  .requiredOption('--lines <range>', 'lines to capture: a single line "42" or a range "42-56" (1-based, inclusive)')
  .option('--highlight-red <specs>', 'draw red highlights; comma-separate and/or repeat (e.g. 13,15-18,19:10-20)', collect, [])
  .option('--highlight-green <specs>', 'draw green highlights; comma-separate and/or repeat (e.g. 13,15-18,19:10-20)', collect, [])
  .option('--fold <ranges>', 'collapse line ranges into a "folded" marker; comma-separate and/or repeat (e.g. 1-20,90-110)', collect, [])
  .addOption(new Option('--context <lines>', 'lines of context kept before/after --lines, clamped to the file')
    .argParser(parseNonNegativeInt).default(3))
  .addOption(new Option('--no-context', 'disable the surrounding context lines (same as --context 0)'))
  .addOption(new Option('--max-lines <n>', 'error if the result exceeds this many rendered rows (so it fits a page); folds count as 1 row, wrapped lines count each')
    .argParser(parsePositiveInt).default(70))
  .addOption(new Option('--no-max-lines', 'disable the rendered-rows limit'))
  .addOption(new Option('--theme <name>', 'color theme').choices(['dark', 'light']).default('dark'))
  .addOption(new Option('--max-width <pixels>', 'cap image width and word-wrap long lines; default ~A4 page width so it fits a document')
    .argParser(parsePositiveInt).default(800))
  .addOption(new Option('--no-max-width', 'disable word wrap (image grows as wide as the longest line)'))
  .option('--output <path>', 'output PNG path (default: <name>_L<start>-<end>.png in the current dir)')
  .option('--root <path>', 'project root for the path shown in the header (default: nearest .git above the file, else the current directory)')
  .addHelpText('after', `
Highlight & fold specs:
  Each flag accepts one or more comma-separated targets (and the flag may be repeated):
    13          a single line
    15-18       a range of lines
    19:10-20    columns 10-20 on line 19   (highlights only — draws a box around those chars)
  Every number is 1-based and inclusive.

Context:
  By default 3 lines are shown before and after the --lines range (clamped to the file)
  so the snippet has surrounding context. Use --context <n> to change it, or --no-context
  to show exactly the requested lines.

Page fit:
  Snipshot is tuned to fit a document page:
    - Width: long lines word-wrap at ~A4 page width by default. Change with --max-width <px>
      or turn wrapping off with --no-max-width.
    - Height: it errors if the result exceeds 70 rendered rows (folded ranges count as 1 row;
      wrapped lines count each row). Raise with --max-lines <n> or remove with --no-max-lines.

Examples:
  snipshot src/app.ts --lines 42-56
  snipshot src/app.ts --lines 42-56 --highlight-red 47,50-52 --highlight-green 55:8-24
  snipshot src/app.ts --lines 1-120 --fold 1-20,90-110
  snipshot src/app.ts --lines 42-56 --theme light --no-context
  snipshot src/app.ts --lines 42-56 --max-width 700 --output docs/snippet.png
`)
  .showHelpAfterError('(run "snipshot --help" for usage and examples)')
  .action(async (file: string, opts: {
    lines: string;
    highlightRed: string[];
    highlightGreen: string[];
    fold: string[];
    context: number | boolean;
    maxLines: number | boolean;
    theme: string;
    maxWidth: number | boolean;
    output?: string;
    root?: string;
  }) => {
    try {
      const lineRange = parseLineRange(opts.lines);

      const highlights: HighlightSpec[] = [
        ...opts.highlightRed.flatMap(v => parseHighlightSpecs(v, 'red')),
        ...opts.highlightGreen.flatMap(v => parseHighlightSpecs(v, 'green')),
      ];

      // --no-context sets context to `false`; otherwise it's the numeric value.
      const contextLines = opts.context === false ? 0 : (opts.context as number);
      // --no-max-lines sets maxLines to `false`; map it to null (disabled).
      const maxLines = opts.maxLines === false ? null : (opts.maxLines as number);
      // --no-max-width sets maxWidth to `false`; map it to undefined (no wrap).
      const maxWidth = opts.maxWidth === false ? undefined : (opts.maxWidth as number);

      const outputPath = await generateCodeShot({
        filePath: file,
        lineRange,
        highlights,
        outputPath: opts.output || '',
        rootPath: opts.root,
        maxWidth,
        folds: opts.fold.flatMap(v => parseLineRanges(v)),
        theme: opts.theme,
        contextLines,
        maxLines,
      });

      console.log(`Screenshot saved to: ${outputPath}`);
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// No arguments at all → show help instead of a "missing argument" error.
if (process.argv.slice(2).length === 0) {
  program.outputHelp();
  process.exit(0);
}

program.parse();
