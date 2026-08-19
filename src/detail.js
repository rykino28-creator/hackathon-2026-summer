import itemTempThumbnailUrl from '../images/item-temp-thumbnail.png';
import { posts, productsById } from './data.js';
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
const productModalTitle = document.getElementById('productModalTitle');
const productOptions = document.getElementById('productOptions');
const relatedProducts = document.getElementById('relatedProducts');
const detailFavoriteButton = document.getElementById('detailFavoriteButton');
const postTags = document.getElementById('postTags');
const postDescription = document.getElementById('postDescription');
const selectionPanel = document.getElementById('selectionPanel');
const selectedProducts = document.getElementById('selectedProducts');
const selectionSummary = document.getElementById('selectionSummary');
const selectedCount = document.getElementById('selectedCount');
const selectedTotal = document.getElementById('selectedTotal');
const selectionChevron = document.getElementById('selectionChevron');
const checkoutButton = document.getElementById('checkoutButton');

const selectedProductIds = new Set();

const urlParams = new URLSearchParams(window.location.search);
const post = findPost(posts, {
  postId: urlParams.get('post'),
  legacyImage: urlParams.get('img')
});

const relationLabels = {
  exact: '写真の商品',
  similar: '類似商品',
  alternative: '代替商品'
};

function closeModal() {
  modal.classList.remove('active');
  overlay.classList.remove('active');
}

function updateCartToggleButton(button, productId) {
  const isSelected = selectedProductIds.has(productId);
  button.classList.toggle('is-selected', isSelected);
  button.setAttribute('aria-pressed', String(isSelected));
  button.textContent = isSelected ? '解除' : 'カートに追加';
}

function refreshModalCartButtons() {
  productOptions.querySelectorAll('[data-cart-product-id]').forEach((button) => {
    updateCartToggleButton(button, button.dataset.cartProductId);
  });
}

function renderSelectedProducts() {
  selectedProducts.replaceChildren();

  let total = 0;
  selectedProductIds.forEach((productId) => {
    const product = productsById[productId];
    if (!product) return;
    total += product.price;

    const row = document.createElement('div');
    row.className = 'selected-product-row';

    const productImage = document.createElement('img');
    productImage.src = itemTempThumbnailUrl;
    productImage.alt = product.name;

    const details = document.createElement('div');
    details.className = 'selected-product-details';

    const name = document.createElement('span');
    name.textContent = product.name;

    const price = document.createElement('strong');
    price.textContent = formatPrice(product.price);

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'selected-product-remove';
    removeButton.textContent = '解除';
    removeButton.setAttribute('aria-label', `${product.name}を選択から解除`);
    removeButton.addEventListener('click', () => {
      selectedProductIds.delete(productId);
      renderSelectedProducts();
      refreshModalCartButtons();
    });

    details.append(name, price);
    row.append(productImage, details, removeButton);
    selectedProducts.appendChild(row);
  });

  selectedCount.textContent = `${selectedProductIds.size}点`;
  selectedTotal.textContent = `合計 ${formatPrice(total)}`;
  checkoutButton.disabled = selectedProductIds.size === 0;

  if (selectedProductIds.size === 0) {
    selectionPanel.classList.remove('is-expanded');
    selectionSummary.setAttribute('aria-expanded', 'false');
    selectionChevron.textContent = '⌃';
  }
}

function toggleProductSelection(productId) {
  if (selectedProductIds.has(productId)) {
    selectedProductIds.delete(productId);
  } else {
    selectedProductIds.add(productId);
  }
  renderSelectedProducts();
  refreshModalCartButtons();
}

function createModalProductOption(productReference) {
  const product = productsById[productReference.productId];
  if (!product) return null;

  const option = document.createElement('article');
  option.className = `modal-product-option relation-${productReference.relation}`;

  const productImage = document.createElement('img');
  productImage.src = itemTempThumbnailUrl;
  productImage.alt = product.name;

  const details = document.createElement('div');
  details.className = 'modal-product-details';

  const relation = document.createElement('span');
  relation.className = 'product-relation-label';
  relation.textContent = relationLabels[productReference.relation];

  const name = document.createElement('h3');
  name.textContent = product.name;

  const price = document.createElement('p');
  price.textContent = `${formatPrice(product.price)}（税込）`;

  const cartButton = document.createElement('button');
  cartButton.type = 'button';
  cartButton.className = 'option-cart-button';
  cartButton.dataset.cartProductId = product.id;
  updateCartToggleButton(cartButton, product.id);
  cartButton.addEventListener('click', () => toggleProductSelection(product.id));

  details.append(relation, name, price);
  option.append(productImage, details, cartButton);
  return option;
}

function openProduct(pinData) {
  productModalTitle.textContent = pinData.sourceType === 'nitori'
    ? 'ニトリ商品と類似商品'
    : 'おすすめの代替商品';
  productOptions.replaceChildren();

  pinData.products.forEach((productReference) => {
    const option = createModalProductOption(productReference);
    if (option) productOptions.appendChild(option);
  });

  modal.classList.add('active');
  overlay.classList.add('active');
}

function createPin(pinData) {
  const pin = document.createElement('button');
  pin.type = 'button';
  pin.className = 'item-pin';
  pin.classList.toggle('item-pin--alternative', pinData.sourceType === 'non-nitori');
  pin.setAttribute('aria-label', '商品候補を表示');
  pin.dataset.pinId = pinData.id;
  pin.style.top = `${pinData.y}%`;
  pin.style.left = `${pinData.x}%`;
  pin.addEventListener('click', (event) => {
    event.stopPropagation();
    openProduct(pinData);
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

function createRepresentativeProductCard(pinData) {
  const product = productsById[pinData.representativeProductId];
  if (!product) return null;

  const card = document.createElement('article');
  card.className = 'product-card';
  card.classList.add(
    pinData.sourceType === 'nitori'
      ? 'product-card--nitori'
      : 'product-card--alternative'
  );

  const mainButton = document.createElement('button');
  mainButton.type = 'button';
  mainButton.className = 'product-card-main';
  mainButton.addEventListener('click', () => openProduct(pinData));

  const productImage = document.createElement('img');
  productImage.src = itemTempThumbnailUrl;
  productImage.alt = product.name;

  const sourceLabel = document.createElement('span');
  sourceLabel.className = 'product-source-label';
  sourceLabel.textContent = pinData.sourceType === 'nitori' ? 'ニトリ商品' : '代替候補';

  const productName = document.createElement('span');
  productName.className = 'product-card-name';
  productName.textContent = product.name;

  const productPrice = document.createElement('span');
  productPrice.className = 'product-card-price';
  productPrice.textContent = formatPrice(product.price);

  mainButton.append(productImage, sourceLabel, productName, productPrice);

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

  post.pins.forEach((pinData) => {
    imageWrap.appendChild(createPin(pinData));
    const card = createRepresentativeProductCard(pinData);
    if (card) relatedProducts.appendChild(card);
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

selectionSummary.addEventListener('click', () => {
  if (selectedProductIds.size === 0) return;
  const isExpanded = selectionPanel.classList.toggle('is-expanded');
  selectionSummary.setAttribute('aria-expanded', String(isExpanded));
  selectionChevron.textContent = isExpanded ? '⌄' : '⌃';
});

// ハッカソン開発中に写真上の座標を取得するための補助機能です。
image.addEventListener('click', (event) => {
  const rect = image.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width * 100).toFixed(1);
  const y = ((event.clientY - rect.top) / rect.height * 100).toFixed(1);
  window.alert(`座標を取得しました\n上から: ${y}%\n左から: ${x}%`);
});

closeButton.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);
renderSelectedProducts();
