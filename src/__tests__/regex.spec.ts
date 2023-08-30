import { describe, expect, it } from 'vitest';

import { isASocialNetworkUrl } from '../helpers/regex.helper';

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
});
