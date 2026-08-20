import {
  loadCartItems,
  loadCartSelection,
  mergeCartProductIds,
  saveCartItems,
  saveCartSelection,
  toggleCartSelectionId
} from './lib/cart-selection.js';

let selectedProductIds = loadCartSelection(window.localStorage);
let cartProductIds = loadCartItems(window.localStorage);

function save() {
  selectedProductIds = saveCartSelection(window.localStorage, selectedProductIds);
}

export function getSelectedProductIds() {
  return [...selectedProductIds];
}

export function setSelectedProductIds(productIds) {
  selectedProductIds = [...productIds];
  save();
}

export function toggleSelectedProduct(productId) {
  selectedProductIds = toggleCartSelectionId(selectedProductIds, productId);
  save();
  return selectedProductIds.includes(productId);
}

export function getCartProductIds() {
  return [...cartProductIds];
}

export function addSelectedProductsToCart() {
  cartProductIds = saveCartItems(
    window.localStorage,
    mergeCartProductIds(cartProductIds, selectedProductIds)
  );
  selectedProductIds = [];
  save();
  return [...cartProductIds];
}
