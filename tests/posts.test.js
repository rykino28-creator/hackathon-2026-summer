import test from 'node:test';
import assert from 'node:assert/strict';
import { findPost, formatPrice, searchPosts } from '../src/lib/posts.js';

const posts = [
  {
    id: 'kitchen-1',
    title: 'フライパンのあるキッチン',
    caption: '調理道具をまとめています',
    image: './images/kitchen1.jpg',
    keywords: ['フライパン'],
    tags: [{ id: 'compact', label: 'コンパクト' }, { id: 'single', label: '一人暮らし' }]
  },
  {
    id: 'kitchen-2',
    title: '収納しやすいキッチン',
    caption: 'ワゴンを使っています',
    image: './images/kitchen2.jpg',
    keywords: ['収納'],
    tags: [
      { id: 'standard', label: 'スタンダード' },
      { id: 'family', label: 'ファミリー' },
      { id: 'storage', label: '収納' }
    ]
  },
  {
    id: 'kitchen-3',
    title: '見せる収納',
    caption: 'スパイスを並べています',
    image: './images/kitchen3.jpg',
    keywords: ['スパイスラック'],
    tags: [
      { id: 'wide', label: 'ワイド' },
      { id: 'family', label: 'ファミリー' },
      { id: 'show-storage', label: '見せる収納' }
    ]
  }
];

test('入力した文字を含む投稿タグに一致する投稿を返す', () => {
  assert.deepEqual(searchPosts(posts, '収納').map((post) => post.id), [
    'kitchen-2',
    'kitchen-3'
  ]);
});

test('検索結果がない場合は空の配列を返す', () => {
  assert.deepEqual(searchPosts(posts, 'ベッド'), []);
});

test('投稿タグの文字列で検索できる', () => {
  assert.deepEqual(searchPosts(posts, 'コンパクト').map((post) => post.id), ['kitchen-1']);
});

test('選択した複数のタグをすべて持つ投稿だけを返す', () => {
  assert.deepEqual(searchPosts(posts, '', ['スタンダード', 'ファミリー']).map((post) => post.id), [
    'kitchen-2'
  ]);
});

test('お気に入り投稿IDで絞り込める', () => {
  assert.deepEqual(searchPosts(posts, '', [], ['kitchen-1', 'kitchen-3']).map((post) => post.id), [
    'kitchen-1',
    'kitchen-3'
  ]);
});

test('投稿IDと旧画像URLの両方で投稿を取得できる', () => {
  assert.equal(findPost(posts, { postId: 'kitchen-2' }).id, 'kitchen-2');
  assert.equal(findPost(posts, { legacyImage: 'kitchen3.jpg' }).id, 'kitchen-3');
});

test('価格を日本円表示に整形する', () => {
  assert.equal(formatPrice(2490), '2,490円');
});
