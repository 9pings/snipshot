import type { LineRange, HighlightSpec } from './types.js';

export function parseLineRange(input: string): LineRange {
  const singleMatch = input.match(/^(\d+)$/);
  if (singleMatch) {
    const line = parseInt(singleMatch[1], 10);
    return { start: line, end: line };
  }

  const rangeMatch = input.match(/^(\d+)-(\d+)$/);
  if (!rangeMatch) {
    throw new Error(
      `Invalid line range: "${input}".\n` +
      `  Use a single line "42" or a range "42-56" (1-based, inclusive).`
    );
  }

  const start = parseInt(rangeMatch[1], 10);
  const end = parseInt(rangeMatch[2], 10);

  if (start > end) {
    throw new Error(`Invalid line range "${input}": start (${start}) must be <= end (${end}).`);
  }

  return { start, end };
}

const HIGHLIGHT_SPEC_HELP =
  'A highlight spec is one of:\n' +
  '    47        a whole line\n' +
  '    47-50     a range of lines\n' +
  '    47:12-38  columns 12-38 on line 47 (draws a box around those characters)\n' +
  '  All numbers are 1-based and inclusive. Combine several with commas, e.g. 13,15-18,19:10-20';

/**
 * Parse a single highlight spec. To parse a comma-separated list
 * (e.g. "13,15-18,19:10-20"), use {@link parseHighlightSpecs}.
 */
export function parseHighlightSpec(input: string, color: 'red' | 'green'): HighlightSpec {
  // Column range (boxed characters): "47:12-38"
  const colMatch = input.match(/^(\d+):(\d+)-(\d+)$/);
  if (colMatch) {
    const line = parseInt(colMatch[1], 10);
    const colStart = parseInt(colMatch[2], 10);
    const colEnd = parseInt(colMatch[3], 10);
    if (colStart > colEnd) {
      throw new Error(`Invalid highlight spec "${input}": start column (${colStart}) must be <= end column (${colEnd}).`);
    }
    return { color, lineStart: line, lineEnd: line, colStart, colEnd };
  }

  // Line range: "47-50"
  const rangeMatch = input.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const lineStart = parseInt(rangeMatch[1], 10);
    const lineEnd = parseInt(rangeMatch[2], 10);
    if (lineStart > lineEnd) {
      throw new Error(`Invalid highlight spec "${input}": start line (${lineStart}) must be <= end line (${lineEnd}).`);
    }
    return { color, lineStart, lineEnd };
  }

  // Single line: "47"
  const singleMatch = input.match(/^(\d+)$/);
  if (singleMatch) {
    const line = parseInt(singleMatch[1], 10);
    return { color, lineStart: line, lineEnd: line };
  }

  throw new Error(`Invalid highlight spec: "${input}".\n  ${HIGHLIGHT_SPEC_HELP}`);
}

/**
 * Parse a comma-separated list of highlight specs into individual specs.
 * Empty segments are ignored, so "13, 15-18 , 19:10-20" works.
 */
export function parseHighlightSpecs(input: string, color: 'red' | 'green'): HighlightSpec[] {
  return splitSpecList(input).map(spec => parseHighlightSpec(spec, color));
}

/**
 * Parse a comma-separated list of line ranges (used by --fold).
 */
export function parseLineRanges(input: string): LineRange[] {
  return splitSpecList(input).map(parseLineRange);
}

/** Split a comma-separated spec list, trimming whitespace and dropping empties. */
export function splitSpecList(input: string): string[] {
  return input.split(',').map(s => s.trim()).filter(Boolean);
}
