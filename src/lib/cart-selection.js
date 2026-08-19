export const CART_SELECTION_STORAGE_KEY = 'minnano-kitchen-cart-selection-v1';

export function loadCartSelection(storage) {
  try {
    const savedIds = JSON.parse(storage.getItem(CART_SELECTION_STORAGE_KEY));
    if (!Array.isArray(savedIds)) return [];
    return [...new Set(savedIds.filter((id) => typeof id === 'string'))];
  } catch {
    return [];
  }
}

export function saveCartSelection(storage, productIds) {
  const normalizedIds = [...new Set(productIds)];
  storage.setItem(CART_SELECTION_STORAGE_KEY, JSON.stringify(normalizedIds));
  return normalizedIds;
}

export function toggleCartSelectionId(productIds, productId) {
  return productIds.includes(productId)
    ? productIds.filter((id) => id !== productId)
    : [...productIds, productId];
}
