import { Router } from 'express';
import { MongoCartManager } from '../controllers/cartManager.js';

const router = Router();

const cartManagerInstance = new MongoCartManager();

// Endpoint POST /api/carts (Create a new cart) 
router.post('/', (req, res) => {
  const newCart = cartManagerInstance.createCart();
  res.status(201).json(newCart);
});

// Endpoint GET using mongoose's POPULATE (/api/carts/:cid)
router.get('/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await cartManagerInstance.getPopulatedCartById(cartId);
    res.json(cart.products);
  } catch (error) {
    res.status(404).json({ error: 'Cart not found' });
  }
});

// Endpoint POST /api/carts/:cid/product/:pid (Add a product to the cart)
router.post('/:cid/product/:pid', async (req, res) => {
  const cartId = req.params.cid; 
  const productId = req.params.pid; 
  const { quantity } = req.body;

  if (!quantity || isNaN(quantity)) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  const cart = cartManagerInstance.addProductToCart(cartId, productId, quantity);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  res.json(cart);
});

// Endpoint DELETE /api/carts/:cid/product/:pid 
router.delete('/:cid/product/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  try {
    const cart = await cartManagerInstance.removeProductFromCart(cartId, productId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error removing the product from the cart' });
  }
});

// Endpoint DELETE /api/carts/:cid 
router.delete('/:cid', async (req, res) => {
  const cartId = req.params.cid;

  try {
    const cart = await cartManagerInstance.clearCart(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error removing all products from the cart' });
  }
});

// Endpoint PUT /api/carts/:cid 
router.put('/:cid', async (req, res) => {
  const cartId = req.params.cid;
  const newProducts = req.body.products;

  try {
    console.log('New products received:', newProducts);
    
    const cart = await cartManagerInstance.updateCart(cartId, newProducts);

    console.log('Cart updated:', cart);
    res.json(cart);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error updating the cart' });
  }
});

// Endpoint PUT /api/carts/:cid/product/:pid
router.put('/:cid/product/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const newQuantity = req.body.quantity;

  try {
    const cart = await cartManagerInstance.updateProductQuantity(cartId, productId, newQuantity);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error updating the product quantity in the cart' });
  }
});

export default router;