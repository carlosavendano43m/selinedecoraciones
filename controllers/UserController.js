const Wishlist = require('../models/Wishlist');
const User = require('../models/User');
const Orden = require('../models/Orden');
const Notificacion = require('../models/Notificacion');
const jwt = require('jsonwebtoken');
const cloudinary = require('../helpers/Cloudinary');
const { getRandomInt } = require('../helpers/formato');
const { decodetoken } = require('../helpers/jwt');
const { makeSalt,encryptPassword } = require('../helpers/crypto.js');
class UserController{
    static getRow = async(req,res)=>{
        res.send('user');
    }
    static putNotification = async(req,res)=>{
        const id=req.params.id;
        const leido = false;
        const notification = await Notificacion.findByIdAndUpdate(id,{leido});

        if(notification){
            res.status(200).json(notification);
        }else{
            res.status(400).json({"res":false,"message":"error al encontrar el servidor"});
        }
    }
    static getNotification = async(req,res)=>{
        const id=req.params.id;
        const notification = await Notificacion.find({"id":id}).sort({createdAt:-1});
        if(notification.length > 0){
            res.status(200).json(notification);
        }else{
            res.status(400).json({"res":false,"message":"error al encontrar el servidor"});
        }
    }
    static getOrden = async(req,res)=>{
        const id=req.params.id;
        const orden = await Orden.find({"user._id":id});
        if(orden.length > 0){
            res.status(200).json(orden);
        }else{
            res.status(400).json({"res":false,"message":"error al encontrar el servidor"});
        }
    }
    static getAddress = async(req,res)=>{
        const id=req.params.id;
        const user = await User.findById(id);
        if(user){
            res.status(201).json(user);
        }else{
            res.status(400).json({"res":false,"message":"error al encontrar el servidor"});
        }
        
    }
    static putChangeAvatar = async(req,res)=>{
        const {id} = req.body;
        let avatar;
        if(req.file){
            const result=await cloudinary.v2.uploader.upload(req.file.path);
            avatar=result.secure_url;
        }else{
            avatar='assets/image/avatar/img12.jpg';
        }
        const response=await User.findByIdAndUpdate(id,{avatar});
        if(response){
            res.status(200).json({"res":true,"title":"Cambio exitoso","message":"Cambio de avatar exitoso"});
        }else{
            res.status(200).json({"res":false,"title":"Error","message":"Error al cambiar avatar"})
        }
    }
    static putAddress = async(req,res)=>{
        const { id,_id } = req.body;
        let body = req.body;
        body.direccioncompleta = `${body.direccion}, ${body.direccion2}, ${body.region}, ${body.comuna}`;
        const user = await User.findById(id);
        if(user){
             let direction=user.direccion.map(x=>{
                if(x._id === _id){
                    return body;
                }else{
                    return x;
                } 
             })
             const direccion=direction;
             await User.findByIdAndUpdate(id,{direccion});
             console.log(direction);
             return res.status(201).json({"res":true,"title":"Modificación exitosa","message":"Dirección editada"});
        }else{
            return res.status(400).json({"res":false,"title":"Error al editar","message":"Error al editar dirección"});
        }
    }
    static deleteAddress = async(req,res)=>{
        const {id,_id}=req.body;
        const user=await User.findById(id);
        if(user){
            let direccion=user.direccion.filter(x=>{return x._id !== _id});
            await User.findByIdAndUpdate(id,{direccion});
            res.status(201).json({"res":true,"title":"Eliminación exitosa","message":"Dirección eliminada"});
        }else{
            res.status(400).json({"res":false,"title":"Error al eliminar","message":"Error al eliminar dirección"});
        }
    }
    static postAddress = async(req,res)=>{
        let body=req.body;
        const is=getRandomInt(10000,99999);
        body._id = is;
        body.direccioncompleta = `${body.direccion}, ${body.direccion2}, ${body.region}, ${body.comuna}`;
        const id=body.id;
        const user=await User.findById(id);
        if(user){
            let direccion=user.direccion;
            if(direccion[0] === ""){
                direccion=[body];
            }else{
                direccion.push(body);
            }
            const s=await User.findByIdAndUpdate(id,{direccion});
            res.status(201).json({"res":true,"title":"Dirección agregada","message":"Dirección agregada"});
        }
        
    }
    static changePassword = async(req,res)=>{
        const { id,password } = req.body;
        const user=await User.findById(id);
        if(user){
            const salt = makeSalt();
            const hashed_password = encryptPassword(salt,password);
            const s=await User.findByIdAndUpdate(id,{salt,hashed_password});
            res.status(201).json({"res":true,"message":"Cambio de contraseña correcta"});
        }else{
            res.status(400).json({"res":false,"message":"Error al cambiar contraseña"});
        }
    }
    static putUserProfile = async(req,res)=>{
        const {nombre,apellido,telefono,email,userNewsletter,descripcion,token} = req.body;
        const decode = decodetoken(token);
        const id=decode._id;
        const response=await User.findByIdAndUpdate(id,{nombre,apellido,telefono,email,descripcion,userNewsletter});
        res.status(200).json({res:true,data:decode});
    }
    static getWishlist = async(req,res)=>{
        const decode = decodetoken(req.headers.token);
        const id=decode._id;
        const wishlist=await Wishlist.findOne({id:id});
       if(wishlist){
            return res.status(201).json(wishlist);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
        }
    }
    static postWishlist = async(req,res)=>{
        const body=req.body;
 
        const tokendecode= jwt.decode(body.token);
        const id = tokendecode._id;
     
        const w=await Wishlist.findOne({id:id});
   
        let response;
        if(w){
            const items=w.items;
           
            if(items.findIndex(item => item._id === body.items._id) > -1){
                const i=items.findIndex(item => item._id === body.items._id);
                res.status(404).json({"res":false,"message":"Artículo ya se encuentra agregado a la lista de deseo"});
            }else{
                items.push(body.items);
                response = await Wishlist.findByIdAndUpdate(w._id,{items});
                res.status(202).json({"res":true,"message":"Artículo agregado a la lista de deseo"});
            }
            
        }else{
            const saves={
                id:id,
                items:body.items
            }
            let wishlist = new Wishlist(saves);
            response = await wishlist.save();
            res.status(202).json({"res":true,"message":"item agregado a la lista de deseo"});
        }  
    }
    static deleteItemsWishlist = async (req,res)=>{
        const body = req.body;
        const tokendecode= jwt.decode(body.token);
        const id = tokendecode._id;
        const idproduct= body.producto._id;

        const w=await Wishlist.findOne({id:id});
        if(w){

            let items=w.items.filter(x=>{return x._id !== idproduct});
            await Wishlist.findByIdAndUpdate(w._id,{items});
            res.status(202).json({"res":true,"message":"Artículo agregado a la lista de deseo"});

        }else{
            res.status(401).json({"res":false,"message":"Artículo no se eliminar agregar a la lista de deseo"});
        }
    }
}


module.exports = UserController;