import { posts, productsById } from './data.js';
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
  modalImage.src = product.image;
  modalImage.alt = product.name;
  modalName.textContent = product.name;
  modalPrice.innerHTML = `${formatPrice(product.price)}<span>（税込）</span>`;
  buyButton.onclick = () => {
    window.open(product.url, '_blank', 'noopener,noreferrer');
  };
  modal.classList.add('active');
  overlay.classList.add('active');
}

function createMarker(marker) {
  const pin = document.createElement('button');
  pin.type = 'button';
  pin.className = 'item-pin';
  pin.setAttribute('aria-label', '商品情報を表示');
  pin.style.top = `${marker.y}%`;
  pin.style.left = `${marker.x}%`;
  pin.addEventListener('click', (event) => {
    event.stopPropagation();
    const product = productsById[marker.productId];
    if (product) openProduct(product);
  });
  return pin;
}

if (post) {
  image.src = post.image;
  image.alt = post.title;
  post.markers.forEach((marker) => imageWrap.appendChild(createMarker(marker)));
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
