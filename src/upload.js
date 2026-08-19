import { products } from './data.js';
import { formatPrice } from './lib/posts.js';

const imageInput = document.getElementById('imageInput');
const uploadLabel = document.getElementById('uploadLabel');
const previewWrap = document.getElementById('previewWrap');
const previewImage = document.getElementById('previewImage');
const productSelectArea = document.getElementById('productSelectArea');
const productDropdown = document.getElementById('productDropdown');
const confirmPinButton = document.getElementById('confirmPinBtn');
const submitButton = document.getElementById('submitBtn');

let currentTempPin = null;
const confirmedPins = [];

products.forEach((product) => {
  const option = document.createElement('option');
  option.value = product.id;
  option.textContent = `${product.name}（${formatPrice(product.price)}）`;
  productDropdown.appendChild(option);
});

imageInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ({ target }) => {
    previewImage.src = target.result;
    uploadLabel.style.display = 'none';
    previewWrap.style.display = 'block';
    submitButton.classList.add('is-ready');
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
  if (!productDropdown.value) {
    window.alert('商品を選択してください！');
    return;
  }

  confirmedPins.push({
    id: crypto.randomUUID(),
    sourceType: 'nitori',
    representativeProductId: productDropdown.value,
    x: Number(currentTempPin.dataset.x),
    y: Number(currentTempPin.dataset.y),
    products: [
      { productId: productDropdown.value, relation: 'exact' }
    ]
  });

  currentTempPin.classList.remove('item-pin--temporary');
  currentTempPin = null;
  productDropdown.value = '';
  productSelectArea.style.display = 'none';
});

submitButton.addEventListener('click', () => {
  if (!submitButton.classList.contains('is-ready')) return;

  console.log('投稿デモデータ:', {
    image: previewImage.src,
    pins: confirmedPins
  });
  window.alert('【デモ】投稿が完了しました！\n（保存機能は次の段階で実装します）');
  window.location.href = 'index.html';
});
