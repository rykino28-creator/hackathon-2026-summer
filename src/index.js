import { posts } from './data.js';
import { isPostFavorite, togglePostFavorite } from './favorites.js';
import { searchPosts } from './lib/posts.js';

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('q') || 'フライパン';
const searchInput = document.getElementById('searchInput');
const imageGrid = document.getElementById('imageGrid');

searchInput.value = query;

searchPosts(posts, query).forEach((post) => {
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
    updateFavoriteButton(togglePostFavorite(post.id));
  });

  tile.appendChild(favoriteButton);
  imageGrid.appendChild(tile);
});
