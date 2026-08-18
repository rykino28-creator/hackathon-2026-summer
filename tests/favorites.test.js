import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFavoriteState,
  loadFavoriteState,
  toggleFavoriteId
} from '../src/lib/favorites.js';

const favoritesData = {
  favoritesByUser: [
    { userId: 'user-1', postIds: ['post-1'], productIds: ['product-1'] }
  ]
};

test('JSONからユーザーのお気に入り初期値を作る', () => {
  assert.deepEqual(createFavoriteState(favoritesData, 'user-1'), {
    version: 1,
    userId: 'user-1',
    postIds: ['post-1'],
    productIds: ['product-1']
  });
});

test('IDのお気に入り追加と解除を切り替える', () => {
  assert.deepEqual(toggleFavoriteId(['post-1'], 'post-2'), ['post-1', 'post-2']);
  assert.deepEqual(toggleFavoriteId(['post-1', 'post-2'], 'post-1'), ['post-2']);
});

test('同じユーザーのローカル保存値を優先する', () => {
  const savedState = {
    version: 1,
    userId: 'user-1',
    postIds: ['post-2'],
    productIds: []
  };
  const storage = { getItem: () => JSON.stringify(savedState) };
  const initialState = createFavoriteState(favoritesData, 'user-1');
  assert.deepEqual(loadFavoriteState(storage, initialState), savedState);
});
