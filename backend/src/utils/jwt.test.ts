import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './jwt.js';

describe('JWT Utilities', () => {
  const userId = 'usr_test123';

  it('should generate and verify an access token', () => {
    const token = generateAccessToken({ id: userId });
    assert.ok(typeof token === 'string' && token.length > 0);

    const decoded = verifyAccessToken(token);
    assert.equal(decoded.id, userId);
  });

  it('should generate and verify a refresh token', () => {
    const token = generateRefreshToken({ id: userId });
    assert.ok(typeof token === 'string' && token.length > 0);

    const decoded = verifyRefreshToken(token);
    assert.equal(decoded.id, userId);
  });

  it('should throw unauthorized error when verifying invalid access token', () => {
    assert.throws(() => {
      verifyAccessToken('invalid.token.payload');
    });
  });

  it('should throw unauthorized error when verifying invalid refresh token', () => {
    assert.throws(() => {
      verifyRefreshToken('invalid.refresh.token');
    });
  });
});
