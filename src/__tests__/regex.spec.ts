import { describe, expect, it } from 'vitest';

import { isASocialNetworkUrl, removeEmoji, removeMarkdown } from '../helpers/regex.helper';

describe('Helpers: Regex', () => {
  describe('Rule: isASocialNetworkUrl should regex correctly an url', () => {
    it('isASocialNetworkUrl() should return true when the url is a social network url', () => {
      const url = 'www.facebook.com/username';
      const result = isASocialNetworkUrl(url);
      expect(result).toBe(true);
    });
    it('isASocialNetworkUrl() should return false when the url is not a social network url', () => {
      const url = 'https://blog.richardekwonye.com/bezier-curves';
      const result = isASocialNetworkUrl(url);
      expect(result).toBe(false);
    });
  });
  describe('Rule: removeEmoji should remove all emojis from a string', () => {
    it('removeEmoji() should remove all emojis from a string', () => {
      const text = '👋 Hello, World!<:SpongebobMock:1136008737669259407>';
      const result = removeEmoji(text);
      expect(result).toBe(' Hello, World!');
    });
  });
  describe('Rule: removeMarkdown should remove all markdown from a string', () => {
    it('removeMarkdown() should remove all markdown from a string', () => {
      const text = 'Hello, **World!** This is _me_ I **give** you `reactions` and ~more~ **quoi**';
      const result = removeMarkdown(text);
      expect(result).toBe('Hello, World! This is me I give you reactions and more quoi');
    });
  });
});
