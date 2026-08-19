import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CART_SELECTION_STORAGE_KEY,
  loadCartSelection,
  saveCartSelection,
  toggleCartSelectionId
} from '../src/lib/cart-selection.js';

test('保存されている商品選択を重複なしで読み込む', () => {
  const storage = {
    getItem: () => JSON.stringify(['pan', 'rack', 'pan', 123])
  };
  assert.deepEqual(loadCartSelection(storage), ['pan', 'rack']);
});

test('壊れた商品選択データは空として扱う', () => {
  const storage = { getItem: () => '{broken' };
  assert.deepEqual(loadCartSelection(storage), []);
});

test('商品選択を保存できる', () => {
  let savedValue = '';
  const storage = {
    setItem: (key, value) => {
      assert.equal(key, CART_SELECTION_STORAGE_KEY);
      savedValue = value;
    }
  };
  assert.deepEqual(saveCartSelection(storage, ['pan', 'pan', 'rack']), ['pan', 'rack']);
  assert.equal(savedValue, JSON.stringify(['pan', 'rack']));
});

test('商品の選択と解除を切り替える', () => {
  assert.deepEqual(toggleCartSelectionId(['pan'], 'rack'), ['pan', 'rack']);
  assert.deepEqual(toggleCartSelectionId(['pan', 'rack'], 'pan'), ['rack']);
});
