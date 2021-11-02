const express = require('express');
const router = express.Router();
//////////////// helpers //////////////
var upload = require('../helpers/Multer');
const UserController = require('../controllers/UserController');

router.get('/user-row',UserController.getRow);
router.get('/orden/:id',UserController.getOrden);
router.put('/change/avatar',upload.single('avatar'),UserController.putChangeAvatar);
router.get('/wishlist',UserController.getWishlist);
router.post('/wishlist-post',UserController.postWishlist);
router.post('/wishlist-remove',UserController.deleteItemsWishlist);
router.get('/address/:id',UserController.getAddress);
router.post('/address/post-address',UserController.postAddress);
router.put('/address/put-address',UserController.putAddress);
router.put('/address/delete-address',UserController.deleteAddress);
router.put('/profile-edit',UserController.putUserProfile);
router.put('/change-password',UserController.changePassword);
router.get('/notification/:id',UserController.getNotification);
router.put('/notification/put-notification-state/:id',UserController.putNotification);

module.exports = router