import { module, test } from 'qunit';
import ShopClient from 'shopify-buy/shop-client';
import Config from 'shopify-buy/config';
import { GUID_KEY } from 'shopify-buy/metal/set-guid-for';
import CartModel from 'shopify-buy/models/cart-model';

const configAttrs = {
  myShopifyDomain: 'buckets-o-stuff',
  apiKey: 'abc123',
  appId: 6
};


const config = new Config(configAttrs);

let shopClient;
let fakeLocalStorage;

const { getItem, setItem, removeItem } = localStorage;

module('Integration | ShopClient#fetchRecentCart', {
  setup() {
    shopClient = new ShopClient(config);
    fakeLocalStorage = {};

    localStorage.getItem = function (key) {
      return JSON.stringify(fakeLocalStorage[key]);
    };
    localStorage.setItem = function (key, value) {
      fakeLocalStorage[key] = JSON.parse(value);
    };
    localStorage.removeItem = function (key) {
      delete fakeLocalStorage[key];
    };
  },
  teardown() {
    shopClient = null;
    localStorage.getItem = getItem;
    localStorage.setItem = setItem;
    localStorage.removeItem = removeItem;
  }
});


test('it resolves with an exisitng cart when a reference and corresponding cart exist', function (assert) {
  assert.expect(1);

  const done = assert.async();

  const cartReferenceKey = `references.${config.myShopifyDomain}.recent-cart`;
  const cartId = 'carts.shopify-buy.123';

  const cartAttrs = {
    cart: {
      line_items: [{ variantId: 123 }]
    }
  };

  fakeLocalStorage[cartReferenceKey] = {};
  fakeLocalStorage[cartReferenceKey].referenceId = cartId.replace('carts.', '');
  fakeLocalStorage[cartReferenceKey][GUID_KEY] = cartReferenceKey;
  fakeLocalStorage[cartId] = cartAttrs;

  shopClient.fetchRecentCart().then(cart => {
    assert.deepEqual(cart.attrs, cartAttrs.cart);
    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it resolves with a new cart when a no reference exists, persisting both the cart and reference', function (assert) {
  assert.expect(6);

  const done = assert.async();

  assert.equal(Object.keys(fakeLocalStorage).length, 0);

  shopClient.fetchRecentCart().then(cart => {
    assert.equal(Object.keys(fakeLocalStorage).length, 2);

    assert.ok(cart);
    assert.ok(CartModel.prototype.isPrototypeOf(cart));

    assert.equal(Object.keys(fakeLocalStorage).filter(key => {
      return key.match(/^references\./);
    }).length, 1);

    assert.equal(Object.keys(fakeLocalStorage).filter(key => {
      return key.match(/^carts\./);
    }).length, 1);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});

test('it recovers from broken state when a reference exists to a non-existent cart', function (assert) {
  assert.expect(6);

  const done = assert.async();

  const cartReferenceKey = `references.${config.myShopifyDomain}.recent-cart`;
  const cartId = 'carts.shopify-buy.123';


  fakeLocalStorage[cartReferenceKey] = {};
  fakeLocalStorage[cartReferenceKey].referenceId = cartId.replace('carts.', '');
  fakeLocalStorage[cartReferenceKey][GUID_KEY] = cartReferenceKey;

  assert.equal(Object.keys(fakeLocalStorage).length, 1);

  shopClient.fetchRecentCart().then(cart => {
    assert.equal(Object.keys(fakeLocalStorage).length, 2);

    assert.ok(cart);
    assert.ok(CartModel.prototype.isPrototypeOf(cart));

    assert.equal(Object.keys(fakeLocalStorage).filter(key => {
      return key.match(/^references\./);
    }).length, 1);

    assert.equal(Object.keys(fakeLocalStorage).filter(key => {
      return key.match(/^carts\./);
    }).length, 1);

    done();
  }).catch(() => {
    assert.ok(false, 'promise should not reject');
    done();
  });
});
