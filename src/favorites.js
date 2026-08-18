import favoritesData from '../user-favorites.json';
import {
  FAVORITES_STORAGE_KEY,
  createFavoriteState,
  loadFavoriteState,
  toggleFavoriteId
} from './lib/favorites.js';

const initialState = createFavoriteState(
  favoritesData,
  favoritesData.currentUser.id
);
let state = loadFavoriteState(window.localStorage, initialState);

function save() {
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state));
}

export const currentUser = favoritesData.currentUser;

export function isPostFavorite(postId) {
  return state.postIds.includes(postId);
}

export function togglePostFavorite(postId) {
  state = {
    ...state,
    postIds: toggleFavoriteId(state.postIds, postId)
  };
  save();
  return isPostFavorite(postId);
}

export function isProductFavorite(productId) {
  return state.productIds.includes(productId);
}

export function toggleProductFavorite(productId) {
  state = {
    ...state,
    productIds: toggleFavoriteId(state.productIds, productId)
  };
  save();
  return isProductFavorite(productId);
}
