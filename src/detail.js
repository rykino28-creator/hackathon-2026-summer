import { posts, productsById } from './data.js';
import itemTempThumbnailUrl from '../images/item-temp-thumbnail.png';
import {
  isPostFavorite,
  isProductFavorite,
  togglePostFavorite,
  toggleProductFavorite
} from './favorites.js';
import { findPost, formatPrice } from './lib/posts.js';

const image = document.getElementById('detailImage');
const imageWrap = document.querySelector('.image-wrap');
const modal = document.getElementById('productModal');
const overlay = document.getElementById('overlay');
const closeButton = document.getElementById('closeBtn');
const modalImage = modal.querySelector('.product-img');
const modalName = modal.querySelector('.product-name');
const modalPrice = modal.querySelector('.product-price');
const buyButton = modal.querySelector('.cart-add-btn');
const relatedProducts = document.getElementById('relatedProducts');
const detailFavoriteButton = document.getElementById('detailFavoriteButton');
const postTags = document.getElementById('postTags');
const postDescription = document.getElementById('postDescription');

const urlParams = new URLSearchParams(window.location.search);
const post = findPost(posts, {
  postId: urlParams.get('post'),
  legacyImage: urlParams.get('img')
});

function closeModal() {
  modal.classList.remove('active');
  overlay.classList.remove('active');
}

function openProduct(product) {
  modalImage.src = itemTempThumbnailUrl;
  modalImage.alt = product.name;
  modalName.textContent = product.name;
  modalPrice.innerHTML = `${formatPrice(product.price)}<span>（税込）</span>`;
  buyButton.onclick = () => {
    window.open(product.url, '_blank', 'noopener,noreferrer');
  };
  modal.classList.add('active');
  overlay.classList.add('active');
}

function createPin(pinData) {
  const pin = document.createElement('button');
  pin.type = 'button';
  pin.className = 'item-pin';
  pin.setAttribute('aria-label', '商品情報を表示');
  pin.dataset.pinId = pinData.id;
  pin.style.top = `${pinData.y}%`;
  pin.style.left = `${pinData.x}%`;
  pin.addEventListener('click', (event) => {
    event.stopPropagation();
    const product = productsById[pinData.productId];
    if (product) openProduct(product);
  });
  return pin;
}

function updatePostFavoriteButton(isFavorite) {
  detailFavoriteButton.classList.toggle('is-favorite', isFavorite);
  detailFavoriteButton.setAttribute('aria-pressed', String(isFavorite));
  detailFavoriteButton.textContent = isFavorite
    ? '♥ お気に入りから解除'
    : '♡ お気に入りに追加';
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';

  const mainButton = document.createElement('button');
  mainButton.type = 'button';
  mainButton.className = 'product-card-main';
  mainButton.addEventListener('click', () => openProduct(product));

  const productImage = document.createElement('img');
  productImage.src = itemTempThumbnailUrl;
  productImage.alt = product.name;

  const productName = document.createElement('span');
  productName.className = 'product-card-name';
  productName.textContent = product.name;

  const productPrice = document.createElement('span');
  productPrice.className = 'product-card-price';
  productPrice.textContent = formatPrice(product.price);

  mainButton.append(productImage, productName, productPrice);

  const favoriteButton = document.createElement('button');
  favoriteButton.type = 'button';
  favoriteButton.className = 'product-card-favorite';

  const updateProductFavorite = (isFavorite) => {
    favoriteButton.classList.toggle('is-favorite', isFavorite);
    favoriteButton.setAttribute('aria-pressed', String(isFavorite));
    favoriteButton.setAttribute(
      'aria-label',
      isFavorite ? `${product.name}をお気に入りから解除` : `${product.name}をお気に入りに追加`
    );
    favoriteButton.textContent = isFavorite ? '♥' : '♡';
  };

  updateProductFavorite(isProductFavorite(product.id));
  favoriteButton.addEventListener('click', () => {
    updateProductFavorite(toggleProductFavorite(product.id));
  });

  card.append(mainButton, favoriteButton);
  return card;
}

if (post) {
  image.src = post.image;
  image.alt = post.title;
  post.pins.forEach((pin) => imageWrap.appendChild(createPin(pin)));

  const productIds = [...new Set(post.pins.map((pin) => pin.productId))];
  productIds.forEach((productId) => {
    const product = productsById[productId];
    if (product) relatedProducts.appendChild(createProductCard(product));
  });

  updatePostFavoriteButton(isPostFavorite(post.id));
  detailFavoriteButton.addEventListener('click', () => {
    updatePostFavoriteButton(togglePostFavorite(post.id));
  });

  post.tags.forEach((tag) => {
    const tagElement = document.createElement('span');
    tagElement.className = 'tag-chip';
    tagElement.textContent = `#${tag.label}`;
    postTags.appendChild(tagElement);
  });

  postDescription.textContent = post.description || '説明はまだありません。';
}

// ハッカソン開発中に写真上の座標を取得するための補助機能です。
image.addEventListener('click', (event) => {
  const rect = image.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width * 100).toFixed(1);
  const y = ((event.clientY - rect.top) / rect.height * 100).toFixed(1);
  window.alert(`座標を取得しました\n上から: ${y}%\n左から: ${x}%`);
});

closeButton.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);
