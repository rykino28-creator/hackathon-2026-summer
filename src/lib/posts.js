export function searchPosts(posts, query, selectedTags = []) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedTags = selectedTags.map((tag) => tag.trim().toLowerCase());

  return posts.filter((post) => {
    const postTags = (post.tags || []).map((tag) => tag.label.toLowerCase());
    const searchableText = postTags.join(' ');
    const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
    const matchesTags = normalizedTags.every((selectedTag) => postTags.includes(selectedTag));
    return matchesQuery && matchesTags;
  });
}

export function findPost(posts, { postId, legacyImage }) {
  return posts.find((post) => post.id === postId)
    || posts.find((post) => legacyImage && post.image.endsWith(`/${legacyImage}`))
    || posts[0]
    || null;
}

export function formatPrice(price) {
  return `${price.toLocaleString('ja-JP')}円`;
}
