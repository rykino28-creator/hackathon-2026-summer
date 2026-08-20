export const SEARCH_PROFILE_STORAGE_KEY = 'minnano-kitchen-search-profile-v1';

const emptyProfile = { version: 1, completed: false, tags: [] };

export function loadSearchProfile(storage) {
  try {
    const saved = JSON.parse(storage.getItem(SEARCH_PROFILE_STORAGE_KEY));
    if (saved?.version !== 1 || typeof saved.completed !== 'boolean' || !Array.isArray(saved.tags)) {
      return { ...emptyProfile };
    }
    return {
      version: 1,
      completed: saved.completed,
      tags: [...new Set(saved.tags.filter((tag) => typeof tag === 'string'))]
    };
  } catch {
    return { ...emptyProfile };
  }
}

export function saveSearchProfile(storage, tags) {
  const profile = {
    version: 1,
    completed: true,
    tags: [...new Set(tags)]
  };
  storage.setItem(SEARCH_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

export function replaceCategorySelection(selectedTags, categoryTags, nextTag) {
  const remainingTags = selectedTags.filter((tag) => !categoryTags.includes(tag));
  return nextTag ? [...remainingTags, nextTag] : remainingTags;
}
