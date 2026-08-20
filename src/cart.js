import itemTempThumbnailUrl from '../images/item-temp-thumbnail.png';
import { getCartProductIds } from './cart-selection.js';
import { productsById } from './data.js';
import { formatPrice } from './lib/posts.js';

const cartProductList = document.getElementById('cartProductList');
const cartProductEmpty = document.getElementById('cartProductEmpty');
const orderButton = document.getElementById('orderButton');

function createCartProduct(product) {
  const item = document.createElement('article');
  item.className = 'modal-product-option cart-product-option';

  const image = document.createElement('img');
  image.src = itemTempThumbnailUrl;
  image.alt = product.name;

  const details = document.createElement('div');
  details.className = 'modal-product-details';

  const name = document.createElement('h3');
  name.textContent = product.name;

  const price = document.createElement('p');
  price.textContent = `${formatPrice(product.price)}（税込）`;

  details.append(name, price);
  item.append(image, details);
  return item;
}

const cartProducts = getCartProductIds()
  .map((productId) => productsById[productId])
  .filter(Boolean);

cartProductList.replaceChildren(...cartProducts.map(createCartProduct));
cartProductEmpty.hidden = cartProducts.length > 0;
orderButton.disabled = cartProducts.length === 0;
