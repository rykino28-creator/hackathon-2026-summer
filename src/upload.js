import itemTempThumbnailUrl from '../images/item-temp-thumbnail.png';
import { products, productsById } from './data.js';
import { FILTER_TAG_GROUPS } from './lib/filter-tags.js';
import { formatPrice } from './lib/posts.js';
import { canSubmitPost, normalizeFreeTag } from './lib/upload.js';

const imageInput = document.getElementById('imageInput');
const uploadLabel = document.getElementById('uploadLabel');
const previewWrap = document.getElementById('previewWrap');
const previewImage = document.getElementById('previewImage');
const productSelectArea = document.getElementById('productSelectArea');
const productDropdown = document.getElementById('productDropdown');
const confirmPinButton = document.getElementById('confirmPinBtn');
const selectedProductsSection = document.getElementById('selectedProductsSection');
const selectedProductStrip = document.getElementById('selectedProductStrip');
const uploadTagGroups = document.getElementById('uploadTagGroups');
const showFreeTagButton = document.getElementById('showFreeTagButton');
const freeTagForm = document.getElementById('freeTagForm');
const freeTagInput = document.getElementById('freeTagInput');
const addFreeTagButton = document.getElementById('addFreeTagButton');
const freeTagList = document.getElementById('freeTagList');
const descriptionInput = document.getElementById('descriptionInput');
const submitButton = document.getElementById('submitBtn');

let currentTempPin = null;
let hasImage = false;
const confirmedPins = [];
const selectedTags = new Set();
const freeTags = [];

products.forEach((product) => {
  const option = document.createElement('option');
  option.value = product.id;
  option.textContent = `${product.name}（${formatPrice(product.price)}）`;
  productDropdown.appendChild(option);
});

function updateSubmitState() {
  const isReady = canSubmitPost({
    hasImage,
    pinCount: confirmedPins.length,
    tagCount: selectedTags.size
  });
  submitButton.disabled = !isReady;
  submitButton.classList.toggle('is-ready', isReady);
}

function createSelectedProductCard(pinData) {
  const product = productsById[pinData.representativeProductId];
  if (!product) return null;

  const card = document.createElement('article');
  card.className = 'product-card product-card--nitori upload-product-card';

  const image = document.createElement('img');
  image.src = itemTempThumbnailUrl;
  image.alt = product.name;

  const details = document.createElement('div');
  details.className = 'upload-product-details';

  const name = document.createElement('span');
  name.className = 'product-card-name';
  name.textContent = product.name;

  const price = document.createElement('span');
  price.className = 'product-card-price';
  price.textContent = formatPrice(product.price);

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'upload-product-remove';
  removeButton.textContent = '×';
  removeButton.setAttribute('aria-label', `${product.name}のピンを取り外す`);
  removeButton.addEventListener('click', () => removeConfirmedPin(pinData.id));

  details.append(name, price);
  card.append(image, details, removeButton);
  return card;
}

function renderConfirmedProducts() {
  const cards = confirmedPins.map(createSelectedProductCard).filter(Boolean);
  selectedProductStrip.replaceChildren(...cards);
  selectedProductsSection.hidden = cards.length === 0;
  updateSubmitState();
}

function removeConfirmedPin(pinId) {
  const index = confirmedPins.findIndex((pin) => pin.id === pinId);
  if (index === -1) return;

  const pinData = confirmedPins[index];
  const product = productsById[pinData.representativeProductId];
  if (!window.confirm(`「${product?.name || '選択された商品'}」のピンを取り外しますか？`)) return;

  confirmedPins.splice(index, 1);
  previewWrap.querySelector(`[data-pin-id="${CSS.escape(pinId)}"]`)?.remove();
  renderConfirmedProducts();
}

function updateTagButton(button, tag) {
  const isSelected = selectedTags.has(tag);
  button.classList.toggle('is-selected', isSelected);
  button.setAttribute('aria-pressed', String(isSelected));
  button.replaceChildren(document.createTextNode(tag));
  if (isSelected) {
    const removeMark = document.createElement('span');
    removeMark.className = 'filter-chip-remove';
    removeMark.setAttribute('aria-hidden', 'true');
    removeMark.textContent = '×';
    button.appendChild(removeMark);
  }
}

function createTagButton(tag, extraClass = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `filter-chip upload-tag-chip ${extraClass}`.trim();
  button.dataset.tag = tag;
  button.addEventListener('click', () => {
    if (selectedTags.has(tag)) selectedTags.delete(tag);
    else selectedTags.add(tag);
    updateTagButton(button, tag);
    updateSubmitState();
  });
  updateTagButton(button, tag);
  return button;
}

function renderTagGroups() {
  FILTER_TAG_GROUPS.forEach((group) => {
    const section = document.createElement('section');
    section.className = 'upload-tag-group';

    const heading = document.createElement('h3');
    heading.textContent = group.label;

    const chips = document.createElement('div');
    chips.className = 'filter-chips';
    chips.append(...group.tags.map((tag) => createTagButton(tag)));

    section.append(heading, chips);
    uploadTagGroups.appendChild(section);
  });
}

function addFreeTag() {
  const tag = normalizeFreeTag(freeTagInput.value);
  if (!tag) return;

  const existingButton = document.querySelector(`.upload-tag-chip[data-tag="${CSS.escape(tag)}"]`);
  if (existingButton) {
    selectedTags.add(tag);
    updateTagButton(existingButton, tag);
  } else {
    freeTags.push(tag);
    selectedTags.add(tag);
    freeTagList.appendChild(createTagButton(tag, 'free-tag-chip'));
  }

  freeTagInput.value = '';
  updateSubmitState();
}

imageInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ({ target }) => {
    previewImage.src = target.result;
    uploadLabel.style.display = 'none';
    previewWrap.style.display = 'block';
    hasImage = true;
    updateSubmitState();
  };
  reader.readAsDataURL(file);
});

previewImage.addEventListener('click', (event) => {
  currentTempPin?.remove();

  const rect = previewImage.getBoundingClientRect();
  const x = Number(((event.clientX - rect.left) / rect.width * 100).toFixed(1));
  const y = Number(((event.clientY - rect.top) / rect.height * 100).toFixed(1));

  currentTempPin = document.createElement('div');
  currentTempPin.className = 'item-pin item-pin--temporary';
  currentTempPin.dataset.x = x;
  currentTempPin.dataset.y = y;
  currentTempPin.style.top = `${y}%`;
  currentTempPin.style.left = `${x}%`;
  previewWrap.appendChild(currentTempPin);
  productSelectArea.style.display = 'block';
});

confirmPinButton.addEventListener('click', () => {
  if (!currentTempPin) return;
  const productId = productDropdown.value;
  if (!productId) {
    window.alert('商品を選択してください！');
    return;
  }

  const pinId = crypto.randomUUID();
  const pinData = {
    id: pinId,
    sourceType: 'nitori',
    representativeProductId: productId,
    x: Number(currentTempPin.dataset.x),
    y: Number(currentTempPin.dataset.y),
    products: [{ productId, relation: 'exact' }]
  };
  confirmedPins.push(pinData);

  const confirmedPinElement = currentTempPin;
  confirmedPinElement.classList.remove('item-pin--temporary');
  confirmedPinElement.dataset.pinId = pinId;
  confirmedPinElement.addEventListener('click', (event) => {
    event.stopPropagation();
    removeConfirmedPin(pinId);
  });

  currentTempPin = null;
  productDropdown.value = '';
  productSelectArea.style.display = 'none';
  renderConfirmedProducts();
});

showFreeTagButton.addEventListener('click', () => {
  freeTagForm.hidden = false;
  freeTagInput.focus();
});
addFreeTagButton.addEventListener('click', addFreeTag);
freeTagInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  addFreeTag();
});

submitButton.addEventListener('click', () => {
  if (submitButton.disabled) return;

  console.log('投稿デモデータ:', {
    image: previewImage.src,
    pins: confirmedPins,
    tags: [...selectedTags],
    customTags: freeTags,
    description: descriptionInput.value.trim()
  });
  window.alert('【デモ】投稿が完了しました！\n（保存機能は次の段階で実装します）');
  window.location.href = 'index.html';
});

renderTagGroups();
renderConfirmedProducts();
