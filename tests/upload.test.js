import test from 'node:test';
import assert from 'node:assert/strict';
import { canSubmitPost, normalizeFreeTag } from '../src/lib/upload.js';

test('画像・ピン・タグが揃った場合だけ投稿できる', () => {
  assert.equal(canSubmitPost({ hasImage: true, pinCount: 1, tagCount: 1 }), true);
  assert.equal(canSubmitPost({ hasImage: false, pinCount: 1, tagCount: 1 }), false);
  assert.equal(canSubmitPost({ hasImage: true, pinCount: 0, tagCount: 1 }), false);
  assert.equal(canSubmitPost({ hasImage: true, pinCount: 1, tagCount: 0 }), false);
});

test('自由タグの空白と先頭のハッシュを整形する', () => {
  assert.equal(normalizeFreeTag('  #朝のキッチン  '), '朝のキッチン');
  assert.equal(normalizeFreeTag('   '), '');
  assert.equal(normalizeFreeTag('12345678901234567890123'), '12345678901234567890');
});
