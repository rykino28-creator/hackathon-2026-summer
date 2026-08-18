export function searchPosts(posts, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return posts;

  const matchedPosts = posts.filter((post) => {
    const searchableText = [post.title, post.caption, ...post.keywords]
      .join(' ')
      .toLowerCase();
    return searchableText.includes(normalizedQuery);
  });

  return matchedPosts.length > 0 ? matchedPosts : posts.slice(0, 2);
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
