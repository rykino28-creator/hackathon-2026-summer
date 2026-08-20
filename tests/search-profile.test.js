import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SEARCH_PROFILE_STORAGE_KEY,
  loadSearchProfile,
  replaceCategorySelection,
  saveSearchProfile
} from '../src/lib/search-profile.js';

test('初回訪問では未完了の検索設定を返す', () => {
  const storage = { getItem: () => null };
  assert.deepEqual(loadSearchProfile(storage), { version: 1, completed: false, tags: [] });
});

test('完了した検索タグを重複なしで保存・読込できる', () => {
  let saved = '';
  const storage = {
    getItem: () => saved,
    setItem: (key, value) => {
      assert.equal(key, SEARCH_PROFILE_STORAGE_KEY);
      saved = value;
    }
  };
  saveSearchProfile(storage, ['コンパクト', 'モダン', 'コンパクト']);
  assert.deepEqual(loadSearchProfile(storage), {
    version: 1,
    completed: true,
    tags: ['コンパクト', 'モダン']
  });
});

test('初回質問では同じカテゴリの選択を1つに置き換える', () => {
  assert.deepEqual(
    replaceCategorySelection(['コンパクト', 'モダン'], ['コンパクト', 'スタンダード', 'ワイド'], 'ワイド'),
    ['モダン', 'ワイド']
  );
});

test('こだわらない場合はそのカテゴリのタグを設定しない', () => {
  assert.deepEqual(
    replaceCategorySelection(['コンパクト', 'モダン'], ['コンパクト', 'スタンダード', 'ワイド'], null),
    ['モダン']
  );
});
