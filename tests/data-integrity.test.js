import test from 'node:test';
import assert from 'node:assert/strict';
import postsData from '../posts.json' with { type: 'json' };
import productsData from '../products.json' with { type: 'json' };

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
