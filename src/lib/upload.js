export function canSubmitPost({ hasImage, pinCount, tagCount }) {
  return Boolean(hasImage && pinCount > 0 && tagCount > 0);
}

export function normalizeFreeTag(value, maxLength = 20) {
  return value.trim().replace(/^#+/, '').trim().slice(0, maxLength);
}
