import { describe, it, expect } from 'vitest';
import { parseLineRange, parseHighlightSpec, parseHighlightSpecs, parseLineRanges } from '../src/parser.js';

describe('parseLineRange', () => {
  it('parses "42-56" into start=42, end=56', () => {
    expect(parseLineRange('42-56')).toEqual({ start: 42, end: 56 });
  });

  it('parses single line "42" into start=42, end=42', () => {
    expect(parseLineRange('42')).toEqual({ start: 42, end: 42 });
  });

  it('throws on invalid input "abc"', () => {
    expect(() => parseLineRange('abc')).toThrow();
  });

  it('throws when start > end', () => {
    expect(() => parseLineRange('56-42')).toThrow();
  });
});

describe('parseHighlightSpec', () => {
  it('parses single line "47" as full-line highlight', () => {
    expect(parseHighlightSpec('47', 'red')).toEqual({
      color: 'red',
      lineStart: 47,
      lineEnd: 47,
    });
  });

  it('parses line range "47-50" as multi-line highlight', () => {
    expect(parseHighlightSpec('47-50', 'green')).toEqual({
      color: 'green',
      lineStart: 47,
      lineEnd: 50,
    });
  });

  it('parses column range "47:12-38" as column highlight', () => {
    expect(parseHighlightSpec('47:12-38', 'red')).toEqual({
      color: 'red',
      lineStart: 47,
      lineEnd: 47,
      colStart: 12,
      colEnd: 38,
    });
  });

  it('throws on invalid spec "abc"', () => {
    expect(() => parseHighlightSpec('abc', 'red')).toThrow();
  });

  it('throws when column start > end', () => {
    expect(() => parseHighlightSpec('47:38-12', 'red')).toThrow();
  });
});

describe('parseHighlightSpecs (comma-separated)', () => {
  it('parses a mixed comma-separated list into individual specs', () => {
    expect(parseHighlightSpecs('13,15-18,19:10-20', 'red')).toEqual([
      { color: 'red', lineStart: 13, lineEnd: 13 },
      { color: 'red', lineStart: 15, lineEnd: 18 },
      { color: 'red', lineStart: 19, lineEnd: 19, colStart: 10, colEnd: 20 },
    ]);
  });

  it('ignores surrounding whitespace and empty segments', () => {
    expect(parseHighlightSpecs(' 13 , , 20 ', 'green')).toEqual([
      { color: 'green', lineStart: 13, lineEnd: 13 },
      { color: 'green', lineStart: 20, lineEnd: 20 },
    ]);
  });

  it('throws if any segment is invalid', () => {
    expect(() => parseHighlightSpecs('13,nope', 'red')).toThrow();
  });
});

describe('parseLineRanges (comma-separated)', () => {
  it('parses multiple fold ranges from one string', () => {
    expect(parseLineRanges('1-20,90-110')).toEqual([
      { start: 1, end: 20 },
      { start: 90, end: 110 },
    ]);
  });
});
