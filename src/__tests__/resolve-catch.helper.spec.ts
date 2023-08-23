import { describe, expect, it } from 'vitest';

import { resolveCatch } from '../helpers/resolve-catch.helper';

describe('resolve-catch.helper', () => {
  it('should throw an error if the promise is rejected with an error', async () => {
    const error = new Error('error');

    expect(await resolveCatch(Promise.reject(error))).toEqual([error, undefined]);
  });
  it('should return the data if the promise is resolved', async () => {
    const data = 'data';
    expect(await resolveCatch(Promise.resolve(data))).toEqual([null, data]);
  });
});
