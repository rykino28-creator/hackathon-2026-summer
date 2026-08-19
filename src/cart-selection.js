import {
  loadCartSelection,
  saveCartSelection,
  toggleCartSelectionId
} from './lib/cart-selection.js';

let selectedProductIds = loadCartSelection(window.localStorage);

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
