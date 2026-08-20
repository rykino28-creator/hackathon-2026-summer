import { posts } from './data.js';
import { isPostFavorite, togglePostFavorite } from './favorites.js';
import { FILTER_TAG_GROUPS } from './lib/filter-tags.js';
import { searchPosts } from './lib/posts.js';
import {
  loadSearchProfile,
  replaceCategorySelection,
  saveSearchProfile
} from './lib/search-profile.js';

const urlParams = new URLSearchParams(window.location.search);
const searchProfile = loadSearchProfile(window.localStorage);
const urlTags = urlParams.getAll('tag');
const DEFAULT_SEARCH_TAG = 'フライパン';
const selectedTags = new Set(
  urlTags.length > 0 ? urlTags : [DEFAULT_SEARCH_TAG, ...searchProfile.tags]
);
let favoritesOnly = urlParams.get('favorite') === '1';
let guidedStepIndex = 0;
let isGuidedMode = !searchProfile.completed;

const searchInput = document.getElementById('searchInput');
const searchForm = document.getElementById('searchForm');
const imageGrid = document.getElementById('imageGrid');
const searchSummary = document.getElementById('searchSummary');
const filterToggle = document.getElementById('filterToggle');
const filterPanel = document.getElementById('filterPanel');
const filterGroupsContainer = document.getElementById('filterGroups');
const filterClear = document.getElementById('filterClear');
const favoriteFilter = document.getElementById('favoriteFilter');
const filterOverlay = document.getElementById('filterOverlay');
const filterApply = document.getElementById('filterApply');
const regularFilter = document.getElementById('regularFilter');
const guidedFilter = document.getElementById('guidedFilter');
const guidedFilterStep = document.getElementById('guidedFilterStep');
const guidedFilterTitle = document.getElementById('guidedFilterTitle');
const guidedFilterChoices = document.getElementById('guidedFilterChoices');
const activeFilterList = document.getElementById('activeFilterList');
const addFilterButton = document.getElementById('addFilterButton');
const productTab = document.getElementById('productTab');
const communityTab = document.getElementById('communityTab');
const productPanel = document.getElementById('productPanel');
const communityPanel = document.getElementById('communityPanel');

searchInput.value = urlParams.get('q') || '';

function persistSelectedTags() {
  if (searchProfile.completed || !isGuidedMode) {
    saveSearchProfile(window.localStorage, [...selectedTags]);
  }
}

function updateUrl() {
  const params = new URLSearchParams();
  const query = searchInput.value.trim();
  if (query) params.set('q', query);
  selectedTags.forEach((tag) => params.append('tag', tag));
  if (favoritesOnly) params.set('favorite', '1');
  const nextUrl = params.size > 0 ? `?${params.toString()}` : window.location.pathname;
  window.history.replaceState({}, '', nextUrl);
}

function createPostTile(post) {
  const tile = document.createElement('article');
  tile.className = 'post-tile';

  const link = document.createElement('a');
  link.href = `detail.html?post=${encodeURIComponent(post.id)}`;
  link.className = 'grid-item';

  const image = document.createElement('img');
  image.src = post.thumbnail;
  image.alt = post.title;
  link.appendChild(image);
  tile.appendChild(link);

  const favoriteButton = document.createElement('button');
  favoriteButton.type = 'button';
  favoriteButton.className = 'thumbnail-favorite';

  const updateFavoriteButton = (isFavorite) => {
    favoriteButton.classList.toggle('is-favorite', isFavorite);
    favoriteButton.setAttribute('aria-pressed', String(isFavorite));
    favoriteButton.setAttribute(
      'aria-label',
      isFavorite ? 'お気に入りから解除' : 'お気に入りに追加'
    );
    favoriteButton.textContent = isFavorite ? '♥' : '♡';
  };

  updateFavoriteButton(isPostFavorite(post.id));
  favoriteButton.addEventListener('click', () => {
    const isFavorite = togglePostFavorite(post.id);
    updateFavoriteButton(isFavorite);
    if (favoritesOnly && !isFavorite) renderPosts();
  });

  tile.appendChild(favoriteButton);
  return tile;
}

function renderPosts() {
  const query = searchInput.value;
  const favoritePostIds = favoritesOnly
    ? posts.filter((post) => isPostFavorite(post.id)).map((post) => post.id)
    : null;
  const matchedPosts = searchPosts(posts, query, [...selectedTags], favoritePostIds);
  imageGrid.replaceChildren(...matchedPosts.map(createPostTile));

  const isFiltering = query.trim() || selectedTags.size > 0 || favoritesOnly;
  searchSummary.textContent = isFiltering ? `${matchedPosts.length}件の投稿が見つかりました` : '';
  searchSummary.classList.toggle('is-empty', isFiltering && matchedPosts.length === 0);
  filterClear.hidden = selectedTags.size === 0 && !favoritesOnly;
  updateUrl();
}

function createActiveFilterChip(label, onRemove, isFavorite = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'filter-chip is-selected active-filter-chip';
  button.setAttribute('aria-label', `${label}を検索条件から解除`);
  button.textContent = isFavorite ? '♥ お気に入り' : label;

  const removeMark = document.createElement('span');
  removeMark.className = 'filter-chip-remove';
  removeMark.setAttribute('aria-hidden', 'true');
  removeMark.textContent = '×';
  button.appendChild(removeMark);
  button.addEventListener('click', onRemove);
  return button;
}

function renderActiveFilters() {
  const chips = [...selectedTags].map((tag) => createActiveFilterChip(tag, () => {
    selectedTags.delete(tag);
    persistSelectedTags();
    updateFilterButtons();
    renderActiveFilters();
    renderPosts();
  }));

  if (favoritesOnly) {
    chips.push(createActiveFilterChip('お気に入り', () => {
      favoritesOnly = false;
      updateFilterButtons();
      renderActiveFilters();
      renderPosts();
    }, true));
  }
  activeFilterList.replaceChildren(...chips);
}

function updateFilterButtons() {
  filterGroupsContainer.querySelectorAll('.filter-chip[data-tag]').forEach((button) => {
    const isSelected = selectedTags.has(button.dataset.tag);
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
    button.replaceChildren(document.createTextNode(button.dataset.tag));
    if (isSelected) {
      const removeMark = document.createElement('span');
      removeMark.className = 'filter-chip-remove';
      removeMark.setAttribute('aria-hidden', 'true');
      removeMark.textContent = '×';
      button.appendChild(removeMark);
    }
  });
  favoriteFilter.classList.toggle('is-selected', favoritesOnly);
  favoriteFilter.setAttribute('aria-pressed', String(favoritesOnly));
  favoriteFilter.textContent = favoritesOnly ? '♥ お気に入り ×' : '♡ お気に入り';
  filterToggle.classList.toggle('has-selection', selectedTags.size > 0 || favoritesOnly);
}

function toggleRegularTag(tag) {
  if (selectedTags.has(tag)) selectedTags.delete(tag);
  else selectedTags.add(tag);
  persistSelectedTags();
  updateFilterButtons();
  renderActiveFilters();
  renderPosts();
}

function createFilterGroups() {
  FILTER_TAG_GROUPS.forEach((group) => {
    const section = document.createElement('section');
    section.className = 'filter-group';

    const heading = document.createElement('h2');
    heading.textContent = group.label;

    const chips = document.createElement('div');
    chips.className = 'filter-chips';
    group.tags.forEach((tag) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-chip';
      button.dataset.tag = tag;
      button.addEventListener('click', () => toggleRegularTag(tag));
      chips.appendChild(button);
    });
    if (group.label === 'カラー') chips.appendChild(favoriteFilter);
    section.append(heading, chips);
    filterGroupsContainer.appendChild(section);
  });
  updateFilterButtons();
}

function setFilterPanel(isOpen) {
  filterPanel.hidden = !isOpen;
  filterOverlay.hidden = !isOpen;
  document.body.classList.toggle('filter-open', isOpen);
  filterToggle.classList.toggle('is-open', isOpen);
  filterToggle.setAttribute('aria-expanded', String(isOpen));
}

function setContentTab(tabName) {
  const isCommunity = tabName === 'community';
  communityTab.classList.toggle('is-active', isCommunity);
  communityTab.setAttribute('aria-selected', String(isCommunity));
  productTab.classList.toggle('is-active', !isCommunity);
  productTab.setAttribute('aria-selected', String(!isCommunity));
  communityPanel.hidden = !isCommunity;
  productPanel.hidden = isCommunity;
}

function openRegularFilters() {
  isGuidedMode = false;
  guidedFilter.hidden = true;
  regularFilter.hidden = false;
  updateFilterButtons();
  setFilterPanel(true);
}

function advanceGuidedStep() {
  if (guidedStepIndex < FILTER_TAG_GROUPS.length - 1) {
    guidedStepIndex += 1;
    renderGuidedStep();
  } else {
    completeGuidedOnboarding();
  }
}

function renderGuidedStep() {
  const group = FILTER_TAG_GROUPS[guidedStepIndex];
  guidedFilterStep.textContent = `${guidedStepIndex + 1} / ${FILTER_TAG_GROUPS.length}`;
  guidedFilterTitle.textContent = `${group.label}を選んでください`;

  const buttons = group.tags.map((tag) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-chip guided-filter-chip';
    const isSelected = selectedTags.has(tag);
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
    button.textContent = tag;
    button.addEventListener('click', () => {
      const nextTags = replaceCategorySelection([...selectedTags], group.tags, tag);
      selectedTags.clear();
      nextTags.forEach((selectedTag) => selectedTags.add(selectedTag));
      advanceGuidedStep();
    });
    return button;
  });

  const noPreferenceButton = document.createElement('button');
  noPreferenceButton.type = 'button';
  noPreferenceButton.className = 'filter-chip guided-filter-chip guided-no-preference';
  noPreferenceButton.textContent = 'こだわらない';
  noPreferenceButton.addEventListener('click', () => {
    const nextTags = replaceCategorySelection([...selectedTags], group.tags, null);
    selectedTags.clear();
    nextTags.forEach((selectedTag) => selectedTags.add(selectedTag));
    advanceGuidedStep();
  });

  guidedFilterChoices.replaceChildren(...buttons, noPreferenceButton);
}

function startGuidedOnboarding() {
  isGuidedMode = true;
  guidedStepIndex = 0;
  regularFilter.hidden = true;
  guidedFilter.hidden = false;
  renderGuidedStep();
  setFilterPanel(true);
}

function completeGuidedOnboarding() {
  saveSearchProfile(window.localStorage, [...selectedTags]);
  isGuidedMode = false;
  updateFilterButtons();
  renderActiveFilters();
  renderPosts();
  setFilterPanel(false);
}

filterToggle.addEventListener('click', openRegularFilters);
addFilterButton.addEventListener('click', openRegularFilters);
productTab.addEventListener('click', () => setContentTab('product'));
communityTab.addEventListener('click', () => setContentTab('community'));
filterOverlay.addEventListener('click', () => {
  if (!isGuidedMode) setFilterPanel(false);
});
filterApply.addEventListener('click', () => {
  renderPosts();
  setFilterPanel(false);
});
favoriteFilter.addEventListener('click', () => {
  favoritesOnly = !favoritesOnly;
  updateFilterButtons();
  renderActiveFilters();
  renderPosts();
});
filterClear.addEventListener('click', () => {
  selectedTags.clear();
  favoritesOnly = false;
  persistSelectedTags();
  updateFilterButtons();
  renderActiveFilters();
  renderPosts();
});

function addSearchInputAsTag() {
  const tag = searchInput.value.trim();
  if (!tag) return false;

  selectedTags.add(tag);
  searchInput.value = '';
  persistSelectedTags();
  updateFilterButtons();
  renderActiveFilters();
  renderPosts();
  return true;
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addSearchInputAsTag();
});
searchInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  addSearchInputAsTag();
});
searchInput.addEventListener('input', renderPosts);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !filterPanel.hidden && !isGuidedMode) setFilterPanel(false);
});

createFilterGroups();
setContentTab('community');
renderActiveFilters();
renderPosts();
if (isGuidedMode) startGuidedOnboarding();
else setFilterPanel(false);
