export const FAVORITES_STORAGE_KEY = 'minnano-kitchen-favorites-v1';

export function createFavoriteState(favoritesData, userId) {
  const savedFavorites = favoritesData.favoritesByUser.find(
    (item) => item.userId === userId
  );

  return {
    version: 1,
    userId,
    postIds: [...(savedFavorites?.postIds || [])],
    productIds: [...(savedFavorites?.productIds || [])]
  };
}

export function loadFavoriteState(storage, initialState) {
  try {
    const savedState = JSON.parse(storage.getItem(FAVORITES_STORAGE_KEY));
    if (savedState?.version === 1 && savedState.userId === initialState.userId) {
      return savedState;
    }
  } catch {
    // 壊れたローカルデータは無視し、JSONの初期値を利用します。
  }
  return initialState;
}

export function toggleFavoriteId(ids, targetId) {
  return ids.includes(targetId)
    ? ids.filter((id) => id !== targetId)
    : [...ids, targetId];
}
