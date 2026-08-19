import { posts } from './data.js';
import { isPostFavorite, togglePostFavorite } from './favorites.js';
import { FILTER_TAG_GROUPS } from './lib/filter-tags.js';
import { searchPosts } from './lib/posts.js';

const urlParams = new URLSearchParams(window.location.search);
const selectedTags = new Set(urlParams.getAll('tag'));
let favoritesOnly = urlParams.get('favorite') === '1';
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

searchInput.value = urlParams.get('q') || '';

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

function updateFilterButtons() {
  filterGroupsContainer.querySelectorAll('.filter-chip').forEach((button) => {
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
  favoriteFilter.textContent = favoritesOnly
    ? '♥ お気に入り ×'
    : '♡ お気に入り';
  filterToggle.classList.toggle('has-selection', selectedTags.size > 0 || favoritesOnly);
}

function createFilterGroups() {
  FILTER_TAG_GROUPS.forEach((group) => {
    const section = document.createElement('section');
    section.className = 'filter-group';

    const heading = document.createElement('h2');
    heading.textContent = group.label;
    section.appendChild(heading);

    const chips = document.createElement('div');
    chips.className = 'filter-chips';
    group.tags.forEach((tag) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-chip';
      button.dataset.tag = tag;
      button.addEventListener('click', () => {
        if (selectedTags.has(tag)) selectedTags.delete(tag);
        else selectedTags.add(tag);
        updateFilterButtons();
        renderPosts();
      });
      chips.appendChild(button);
    });
    if (group.label === 'カラー') chips.appendChild(favoriteFilter);
    section.appendChild(chips);
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

filterToggle.addEventListener('click', () => setFilterPanel(filterPanel.hidden));
filterOverlay.addEventListener('click', () => setFilterPanel(false));
filterApply.addEventListener('click', () => {
  renderPosts();
  setFilterPanel(false);
});
favoriteFilter.addEventListener('click', () => {
  favoritesOnly = !favoritesOnly;
  updateFilterButtons();
  renderPosts();
});
filterClear.addEventListener('click', () => {
  selectedTags.clear();
  favoritesOnly = false;
  updateFilterButtons();
  renderPosts();
});
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  renderPosts();
});
searchInput.addEventListener('input', renderPosts);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !filterPanel.hidden) setFilterPanel(false);
});

createFilterGroups();
setFilterPanel(selectedTags.size > 0 || favoritesOnly);
renderPosts();
