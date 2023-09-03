import { paramCase } from 'param-case';

export const normalizeName = (name: string): string =>
  paramCase(
    name
      // Normalize Unicode characters
      .normalize('NFD')
      // Remove diacritics
      .replace(/[\u0300-\u036F]/g, '')
      // Remove non-ASCII characters
      .replace(/[^\u0000-\u007F]/g, ''),
  );
