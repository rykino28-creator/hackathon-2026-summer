import itemTempThumbnailUrl from '../images/item-temp-thumbnail.png';
import { getSelectedProductIds, setSelectedProductIds } from './cart-selection.js';
import { products, productsById } from './data.js';
import { isProductFavorite, toggleProductFavorite } from './favorites.js';
import { formatPrice } from './lib/posts.js';

const favoriteProductList = document.getElementById('favoriteProductList');
const favoriteProductEmpty = document.getElementById('favoriteProductEmpty');
const selectionPanel = document.getElementById('selectionPanel');
const selectedProducts = document.getElementById('selectedProducts');
const selectionSummary = document.getElementById('selectionSummary');
const selectedCount = document.getElementById('selectedCount');
const selectedTotal = document.getElementById('selectedTotal');
const selectionChevron = document.getElementById('selectionChevron');
const checkoutButton = document.getElementById('checkoutButton');

const selectedProductIds = new Set(
  getSelectedProductIds().filter((productId) => productsById[productId])
);

function persistSelectedProducts() {
  setSelectedProductIds([...selectedProductIds]);
}

function updateCartToggleButton(button, productId) {
  const isSelected = selectedProductIds.has(productId);
  button.classList.toggle('is-selected', isSelected);
  button.setAttribute('aria-pressed', String(isSelected));
  button.textContent = isSelected ? '解除' : 'カートに追加';
}

function refreshCartToggleButtons() {
  favoriteProductList.querySelectorAll('[data-cart-product-id]').forEach((button) => {
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

    const image = document.createElement('img');
    image.src = itemTempThumbnailUrl;
    image.alt = product.name;

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
      selectedProductIds.delete(product.id);
      persistSelectedProducts();
      renderSelectedProducts();
      refreshCartToggleButtons();
    });

    details.append(name, price);
    row.append(image, details, removeButton);
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
  if (selectedProductIds.has(productId)) selectedProductIds.delete(productId);
  else selectedProductIds.add(productId);
  persistSelectedProducts();
  renderSelectedProducts();
  refreshCartToggleButtons();
}

function createFavoriteProduct(product) {
  const option = document.createElement('article');
  option.className = 'modal-product-option cart-product-option';

  const image = document.createElement('img');
  image.src = itemTempThumbnailUrl;
  image.alt = product.name;

  const details = document.createElement('div');
  details.className = 'modal-product-details';

  const titleRow = document.createElement('div');
  titleRow.className = 'cart-product-title';

  const name = document.createElement('h3');
  name.textContent = product.name;

  const favoriteButton = document.createElement('button');
  favoriteButton.type = 'button';
  favoriteButton.className = 'cart-product-favorite is-favorite';
  favoriteButton.textContent = '★';
  favoriteButton.setAttribute('aria-label', `${product.name}をお気に入りから解除`);
  favoriteButton.setAttribute('aria-pressed', 'true');
  favoriteButton.addEventListener('click', () => {
    toggleProductFavorite(product.id);
    renderFavoriteProducts();
  });

  const price = document.createElement('p');
  price.textContent = `${formatPrice(product.price)}（税込）`;

  const cartButton = document.createElement('button');
  cartButton.type = 'button';
  cartButton.className = 'option-cart-button';
  cartButton.dataset.cartProductId = product.id;
  updateCartToggleButton(cartButton, product.id);
  cartButton.addEventListener('click', () => toggleProductSelection(product.id));

  titleRow.append(name, favoriteButton);
  details.append(titleRow, price);
  option.append(image, details, cartButton);
  return option;
}

function renderFavoriteProducts() {
  const favoriteProducts = products.filter((product) => isProductFavorite(product.id));
  favoriteProductList.replaceChildren(...favoriteProducts.map(createFavoriteProduct));
  favoriteProductEmpty.hidden = favoriteProducts.length > 0;
}

selectionSummary.addEventListener('click', () => {
  if (selectedProductIds.size === 0) return;
  const isExpanded = selectionPanel.classList.toggle('is-expanded');
  selectionSummary.setAttribute('aria-expanded', String(isExpanded));
  selectionChevron.textContent = isExpanded ? '⌄' : '⌃';
});

persistSelectedProducts();
renderFavoriteProducts();
renderSelectedProducts();
