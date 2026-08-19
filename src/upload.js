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

// 確定済みのピンを削除する関数
function removeConfirmedPin(pinId, pinElement) {
  const pinData = confirmedPins.find(p => p.id === pinId);
  if (!pinData) return;

  // products から商品名を取得して確認ダイアログを表示
  const product = products.find(p => p.id === pinData.productId);
  const productName = product ? product.name : '選択された商品';

  if (window.confirm(`「${productName}」のピンを取り外しますか？`)) {
    // 1. 配列から削除
    const index = confirmedPins.findIndex(p => p.id === pinId);
    if (index !== -1) {
      confirmedPins.splice(index, 1);
    }
    // 2. DOMから要素を削除
    pinElement.remove();
  }
}

confirmPinButton.addEventListener('click', () => {
  if (!currentTempPin) return;
  const productId = productDropdown.value;
  if (!productId) {
    window.alert('商品を選択してください！');
    return;
  }

  const pinId = crypto.randomUUID();

  // 確定ピンデータを追加
  confirmedPins.push({
    id: pinId,
    sourceType: 'nitori',
    representativeProductId: productDropdown.value,
    productId: productId,
    x: Number(currentTempPin.dataset.x),
    y: Number(currentTempPin.dataset.y),
    products: [
      { productId: productDropdown.value, relation: 'exact' }
    ]
  });

  // 一時ピンを確定ピンに変換
  const confirmedPinElement = currentTempPin;
  confirmedPinElement.classList.remove('item-pin--temporary');
  confirmedPinElement.dataset.pinId = pinId;

  // ★重要: 確定ピンをクリックしたときに削除（取り外し）できるようにイベントを登録
  confirmedPinElement.addEventListener('click', (event) => {
    event.stopPropagation(); // 画像クリックイベントの発火を防ぐ
    removeConfirmedPin(pinId, confirmedPinElement);
  });

  // 状態のリセット（これで次のピンを連続して追加できるようになります）
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
