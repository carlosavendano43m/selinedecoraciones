const express = require('express');
const router = express.Router();
const Productos=require('../models/Productos')
////////// helpers //////////////////
var upload = require('../helpers/Multer');
////////////////// controllers //////////
const AdminController = require('../controllers/AdminController');
/////////////////// router ////////////////////////////
router.get('/productos/attributes-aditional',AdminController.getAttributesAditional);
router.get('/orden-user/:id',AdminController.getOrdenUser);
router.get('/dasboard-data',AdminController.getDashBoardData);
router.get('/eventos',AdminController.getEventos);
router.get('/eventos/:id',AdminController.getEventosById);
router.post('/eventos/post',AdminController.postEventos);
router.put('/eventos/put',AdminController.putEventos);
router.delete('/eventos/delete/:id',AdminController.deleteEventos);
router.get('/gift-card',AdminController.getGiftCard);
router.post('/gift-card/post',AdminController.postGiftCard);
router.put('/gift-card/put',AdminController.putGiftCard);
router.delete('/gift-card/delete/:id',AdminController.deleteGiftCard);
router.get('/transporte',AdminController.getTransporte);
router.post('/transporte/post',AdminController.postTransporte);
router.put('/transporte/put',AdminController.putTransporte);
router.delete('/transporte/delete/:id',AdminController.deleteTransporte);
router.get('/orden',AdminController.getOrden);
router.get('/orden/:id',AdminController.getOrdenDetails);
router.delete('/orden/delete/:id',AdminController.deleteOrden);
router.get('/user',AdminController.getUser);
router.post('/user/post',upload.single('avatar'),AdminController.postUser);
router.put('/user/put',upload.single('avatar'),AdminController.putUser);
router.delete('/user/delete/:id',AdminController.deleteUser);
router.get('/marcas',AdminController.getMarcas);
router.post('/marcas/post',upload.single('imgmarcas'),AdminController.postMarcas);
router.put('/marcas/put',upload.single('imgmarcas'),AdminController.putMarcas);
router.delete('/marcas/delete/:id',AdminController.deleteMarcas);
router.get('/categorias',AdminController.getCategoria);
router.post('/categorias/post',upload.single('imgcategory'),AdminController.postCategoria);
router.put('/categorias/put',upload.single('imgcategory'),AdminController.putCategoria);
router.delete('/categorias/delete/:id',AdminController.deleteCategoria);
router.get('/productos/:id',AdminController.getProductoById);
router.get('/productos',AdminController.getProductos);
router.post('/productos/post',upload.array('imgproducts'),AdminController.postProductos);
router.put('/productos/put',upload.array('imgproducts'),AdminController.putProductos);
router.delete('/productos/delete/:id',AdminController.deleteProductos);
const uploadfields = upload.fields([
  { name: 'portadacatalogo', maxCount: 1 },
  { name: 'pdfcatalogo', maxCount: 1 }
]);
router.get('/catalogo',AdminController.getCatalogo);
router.post('/catalogo/post',uploadfields,AdminController.postCatalogo);
router.delete('/catalogo/delete/:id',uploadfields,AdminController.deleteCatalogo);
router.get('/respaldo/productos',async(req,res)=>{
  const productos=await Productos.find();
  
  productos.forEach(async element=>{
    id=element._id;
    cantidad=20;
    await Productos.findByIdAndUpdate(id,{cantidad});
  })
  res.json(productos);
})
module.exports = router