const express = require('express');
const router = express.Router();
const bodyParse = require('body-parser');


///////////// controller ////////
const ContactoController = require('../controllers/ContactoController');
const APIController = require ('../controllers/APIController');
const CartController=require('../controllers/CartController');

router.get('/',(req,res) => {
  res.redirect('https://decoracionesseline.netlify.app/');
})

router.get('/transporte',APIController.getTransporte);
router.get('/catalogo',APIController.getCatalogo);
router.get('/catalogo/:id',APIController.getCatalogoDetails);
router.get('/menu',APIController.getMenu);
router.get('/menus',APIController.getMenus);
router.get('/categorias',APIController.getCategorias);
router.post('/contacto',ContactoController.sendMail);
router.post('/usersnewsletter',APIController.postNewsletterUser);
router.get('/productos',APIController.getProductos);
router.get('/productos-home',APIController.getProductosHome);
router.get('/productos-detalles/:id',APIController.getProductosDetalles);
router.get('/productos-relacion/:categoria',APIController.getProductosRelacionados);
router.get('/productos/shipping-option',APIController.getOptionShipping);
router.get('/ratings/:id',APIController.getRatings);
router.get('/regiones',APIController.getRegiones);
router.post('/post-ratings',APIController.postRatings);
router.post('/post-like-ratings',APIController.postLikeRatings);
router.post('/post-dislike-ratings',APIController.postDisLikeRatings);

router.get('/get-tracking/:id',APIController.getTracking);
router.post('/post-tracking',APIController.postTracking);

router.get('/cart-last-orden/:token',CartController.getLastOrden);
router.get('/cart-get',CartController.getCart);
router.post('/cart-post',CartController.postCart);
router.put('/cart-put',CartController.putCart);
router.put('/cart-put-itemquality',CartController.putCartQualityItem);
router.put('/cart-put-data',CartController.putData);
router.put('/code-discount',CartController.putCodeDiscount);
router.post('/cart-delete-item',CartController.deleteItemsCart);
router.delete('/cart-delete-item-all',CartController.deleteItemsAllCart);
router.post('/post-shipping-option',APIController.getOptionShipping);

module.exports = router