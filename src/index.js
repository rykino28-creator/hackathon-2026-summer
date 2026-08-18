import { posts } from './data.js';
import { searchPosts } from './lib/posts.js';

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('q') || 'フライパン';
const searchInput = document.getElementById('searchInput');
const imageGrid = document.getElementById('imageGrid');

searchInput.value = query;

searchPosts(posts, query).forEach((post) => {
  const link = document.createElement('a');
  link.href = `detail.html?post=${encodeURIComponent(post.id)}`;
  link.className = 'grid-item';

  const image = document.createElement('img');
  image.src = post.thumbnail;
  image.alt = post.title;

  link.appendChild(image);
  imageGrid.appendChild(link);
});
