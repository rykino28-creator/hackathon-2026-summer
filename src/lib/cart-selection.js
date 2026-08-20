export const CART_SELECTION_STORAGE_KEY = 'minnano-kitchen-cart-selection-v1';
export const CART_ITEMS_STORAGE_KEY = 'minnano-kitchen-cart-items-v1';

function loadProductIds(storage, storageKey) {
  try {
    const savedIds = JSON.parse(storage.getItem(storageKey));
    if (!Array.isArray(savedIds)) return [];
    return [...new Set(savedIds.filter((id) => typeof id === 'string'))];
  } catch {
    return [];
  }
}

function saveProductIds(storage, storageKey, productIds) {
  const normalizedIds = [...new Set(productIds)];
  storage.setItem(storageKey, JSON.stringify(normalizedIds));
  return normalizedIds;
}

export function loadCartSelection(storage) {
  return loadProductIds(storage, CART_SELECTION_STORAGE_KEY);
}

export function saveCartSelection(storage, productIds) {
  return saveProductIds(storage, CART_SELECTION_STORAGE_KEY, productIds);
}

export function loadCartItems(storage) {
  return loadProductIds(storage, CART_ITEMS_STORAGE_KEY);
}

export function saveCartItems(storage, productIds) {
  return saveProductIds(storage, CART_ITEMS_STORAGE_KEY, productIds);
}

export function mergeCartProductIds(cartProductIds, addedProductIds) {
  return [...new Set([...cartProductIds, ...addedProductIds])];
}

export function toggleCartSelectionId(productIds, productId) {
  return productIds.includes(productId)
    ? productIds.filter((id) => id !== productId)
    : [...productIds, productId];
}
