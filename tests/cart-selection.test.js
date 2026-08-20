import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CART_ITEMS_STORAGE_KEY,
  CART_SELECTION_STORAGE_KEY,
  loadCartItems,
  loadCartSelection,
  mergeCartProductIds,
  saveCartItems,
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

test('カート投入済み商品を保存・読込できる', () => {
  let savedValue = '';
  const storage = {
    getItem: () => JSON.stringify(['pan', 'rack', 'pan']),
    setItem: (key, value) => {
      assert.equal(key, CART_ITEMS_STORAGE_KEY);
      savedValue = value;
    }
  };

  assert.deepEqual(loadCartItems(storage), ['pan', 'rack']);
  assert.deepEqual(saveCartItems(storage, ['pan', 'pan']), ['pan']);
  assert.equal(savedValue, JSON.stringify(['pan']));
});

test('選択商品を既存カートに重複なしで追加する', () => {
  assert.deepEqual(
    mergeCartProductIds(['pan', 'rack'], ['rack', 'wagon']),
    ['pan', 'rack', 'wagon']
  );
});
