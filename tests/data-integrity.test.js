import test from 'node:test';
import assert from 'node:assert/strict';
import postsData from '../posts.json' with { type: 'json' };
import productsData from '../products.json' with { type: 'json' };
import favoritesData from '../user-favorites.json' with { type: 'json' };

test('投稿ごとに異なる数のピンを持つ', () => {
  const pinCounts = postsData.posts.map((post) => post.pins.length);
  assert.deepEqual(pinCounts, [3, 2, 4, 1]);
  assert.equal(new Set(pinCounts).size, pinCounts.length);
});

test('全ピンのID・座標・商品参照が正しい', () => {
  const productIds = new Set(productsData.products.map((product) => product.id));
  const pinIds = new Set();

  postsData.posts.forEach((post) => {
    post.pins.forEach((pin) => {
      assert.ok(pin.id);
      assert.equal(pinIds.has(pin.id), false);
      pinIds.add(pin.id);
      assert.ok(productIds.has(pin.productId));
      assert.ok(pin.x >= 0 && pin.x <= 100);
      assert.ok(pin.y >= 0 && pin.y <= 100);
    });
  });
});

test('全投稿に投稿者と1件以上のタグがある', () => {
  postsData.posts.forEach((post) => {
    assert.ok(post.author.id);
    assert.ok(post.author.displayName);
    assert.ok(post.description);
    assert.ok(post.tags.length > 0);
    assert.equal(new Set(post.tags.map((tag) => tag.id)).size, post.tags.length);
  });
});

test('ユーザー別お気に入りが存在する投稿と商品だけを参照する', () => {
  const postIds = new Set(postsData.posts.map((post) => post.id));
  const productIds = new Set(productsData.products.map((product) => product.id));
  const userIds = new Set([
    favoritesData.currentUser.id,
    ...postsData.posts.map((post) => post.author.id)
  ]);

  favoritesData.favoritesByUser.forEach((favorites) => {
    assert.ok(userIds.has(favorites.userId));
    favorites.postIds.forEach((id) => assert.ok(postIds.has(id)));
    favorites.productIds.forEach((id) => assert.ok(productIds.has(id)));
  });
});
