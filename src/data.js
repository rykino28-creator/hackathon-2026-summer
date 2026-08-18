import postsData from '../posts.json';
import productsData from '../products.json';
import kitchen1Url from '../images/kitchen1.jpg';
import kitchen2Url from '../images/kitchen2.jpg';
import kitchen3Url from '../images/kitchen3.jpg';
import kitchen4Url from '../images/kitchen4.jpg';

const imageUrls = {
  './images/kitchen1.jpg': kitchen1Url,
  './images/kitchen2.jpg': kitchen2Url,
  './images/kitchen3.jpg': kitchen3Url,
  './images/kitchen4.jpg': kitchen4Url
};

function resolveImage(path) {
  return imageUrls[path] || path;
}

export const posts = postsData.posts.map((post) => ({
  ...post,
  image: resolveImage(post.image),
  thumbnail: resolveImage(post.thumbnail)
}));

export const products = productsData.products.map((product) => ({
  ...product,
  image: resolveImage(product.image)
}));

export const productsById = Object.fromEntries(
  products.map((product) => [product.id, product])
);
