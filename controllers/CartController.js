const {formateadordemiles} = require('../helpers/formato');
const jwt = require('jsonwebtoken');
////// models ///////////////////
const Cart=require('../models/Cart');
const Orden=require('../models/Orden');
const GiftCard=require('../models/GiftCard');

class CartController{

    static putData = async(req,res)=>{
        const {token,descripcion,direccion,shipping} = req.body;

        const cart = jwt.decode(token);
        const id = cart._id;
        cart.descripcion = descripcion;
        cart.direccion = direccion;
        const response = await Cart.findByIdAndUpdate(id,{descripcion,direccion,shipping});

        const jwts = jwt.sign(
          {
            _id: cart._id,
            cantidad:cart.cantidad,
            items:cart.items,
            total:cart.total,
            descuento:cart.descuento,
            descripcion:cart.descripcion,
            direccion:direccion,
            shipping:shipping,
            totalformateado:cart.totalformateado,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '7d'
          }
        );
        res.status(200).json({"res":true,"token":jwts});
    }

    static getLastOrden = async(req,res)=>{
      const token=req.params.token;
      const orden =await Orden.findOne({token:token});
      if(orden){
        res.status(200).json(orden);
      }else{
        return res.status(404).send({errors:["No se encuentra esa Publicacíon"]});
      }
    }

    static postCart = async(req,res)=>{
        const data=req.body;
        console.log(data);
        data.precio*=data.cantidad;
        data.precioformateado=formateadordemiles(data.precio);
        
        const cart={
            items:[data],
            total:data.precio,
            totalformateado:data.precioformateado,
            cantidad:data.cantidad,
            descripcion:data.descripcion,
            direccion:{},
            shipping:{},
        };
       
        let model = new Cart(cart);
        const d=await model.save();
        
        const token = jwt.sign(
            {
              _id: d._id,
              cantidad:d.cantidad,
              items:d.items,
              total:d.total,
              descripcion:d.descripcion,
              direccion:d.direccion,
              shipping:d.shipping,
              totalformateado:d.totalformateado,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: '7d'
            }
        );
        
        res.status(200).json({"res":true,data:d,token:token});
    }
    static getCart = async(req,res)=>{
        const token=req.headers.tokencart;
        const cart=jwt.decode(token);
        /*const cart= await Cart.findById(id);
        if(cart){
            res.status(201).json(cart);
        }else{
            return res.status(404).send({errors:["No se encuentra esa Publicacíon"]})
        }*/
        res.status(201).json(cart);    
    }
    static putCart = async(req,res)=>{
        const {data,token} = req.body;

        let jwts = jwt.decode(token);
        const id = jwts._id; 
        const items = jwts.items;
        let total=0;
        let quality=0;
        if(items.findIndex(item => item.id === data.id) > -1){
          const i=items.findIndex(item => item.id === data.id);
          items[i].precio+=(data.precio*parseInt(data.cantidad));
          items[i].precioformateado=formateadordemiles(items[i].precio);
          items[i].cantidad+=parseInt(data.cantidad);
        }else{
          items.push(data);
        }

        items.forEach(element=>{
            total+=element.precio;
            quality+=parseInt(element.cantidad);
        });
        const totalformateado=formateadordemiles(total);
        const cantidad=quality;
        const direccion = jwts.direccion;
        const updatedCart= await Cart.findByIdAndUpdate(id,{items,total,totalformateado,direccion,cantidad});

        jwts.items=items;
        jwts.total=total;
        jwts.cantidad=quality;
        jwts.totalformateado=formateadordemiles(total);
    
        const token1 = jwt.sign(
            {
              _id: jwts._id,
              cantidad:jwts.cantidad,
              items:jwts.items,
              total:jwts.total,
              totalformateado:jwts.totalformateado,
              descripcion:jwts.descripcion,
              direccion:jwts.direccion,
              descuento:jwts.descuento ? jwts.descuento : null,
              shipping:jwts.shipping,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: '7d'
            }
        );
        
        res.status(200).json({"res":data,"data":updatedCart,token:token1});
    }
    static deleteItemsCart = async(req,res)=>{
        const {token,id} = req.body;
        let cart = jwt.decode(token);
    
        let total=0;
        let quality=0;
        if(cart){
            let ids=cart._id;
            let items=cart.items;
            if(items.findIndex(item => item.id === id) > -1){
                const i=items.findIndex(item => item.id === id);
                items.splice(i,1);
            }
            items.forEach(element=>{
                total+=element.precio;
                quality+=element.cantidad;
            })
         
            const totalformateado=formateadordemiles(total);
            const cantidad=quality;

            cart.items=items;
            cart.total=total;
            cart.totalformateado=totalformateado;
            cart.cantidad=cantidad;

            const token1 = jwt.sign(
              {
                _id: cart._id,
                cantidad:cart.cantidad,
                items:cart.items,
                total:cart.total,
                totalformateado:cart.totalformateado,
                descripcion:cart.descripcion,
                direccion:cart.direccion,
                descuento:cart.descuento ? cart.descuento : null,
                shipping:cart.shipping,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: '7d'
              }
          );
      
            const updatedCart = await Cart.findByIdAndUpdate(ids,{items,total,totalformateado,cantidad});
            res.status(200).json({"res":true,"token":token1});
        }   
    }

    static putCodeDiscount = async(req,res) =>{
      const {code,token}=req.body;

      const jwts=jwt.decode(token);

      const response = await GiftCard.findOne({code:code});
      
      if(response){
          const id = response._id;
          const validaters = response.validater;
          if(validaters){
              const response2 = await GiftCard.findByIdAndUpdate(id,{validater:false});
              
              const token = jwt.sign(
                  {
                  _id: jwts._id,
                  cantidad:jwts.cantidad,
                  items:jwts.items,
                  total:jwts.total,
                  totalformateado:jwts.totalformateado,
                  descripcion:jwts.descripcion,
                  direccion:jwts.direccion,
                  shipping:jwts.shipping,
                  descuento:response,
                  },
                  process.env.JWT_SECRET,
                  {
                  expiresIn: '7d'
                  }
              );
              return res.status(200).json({"res":true,"data":response,"token":token});
          }else{
              return res.status(200).json({"res":false,"title":"",message:"Error código en uso"});
          }
          
        }else{
            return res.status(200).json({"res":false,"title":"",message:"Error código no existe"});
        }
        

    }

    static putCartQualityItem = async(req,res)=>{
      const {token,id,cant} = req.body;
  
      let cart = jwt.decode(token);
      let ct=parseInt(cant);
      let items=cart.items;
      let total=0;
      let quality=0;
 
      if(items.findIndex(item => item.id === id) > -1){
        const i=items.findIndex(item => item.id === id);
        items[i].precio=parseInt(items[i].preciounitario)*ct;
        items[i].precioformateado=formateadordemiles(items[i].precio);
        items[i].cantidad=ct;
      }

      items.forEach(element=>{
          total+=element.precio;
          quality+=parseInt(element.cantidad);
      })

      const totalformateado=formateadordemiles(total);
      let cantidad=quality;
      cart.total = total;
      cart.totalformateado = totalformateado;
      cart.items = items;
      cart.cantidad = cantidad;

      const updatedCart= await Cart.findByIdAndUpdate(cart._id,{items,total,totalformateado,cantidad});
      const token1 = jwt.sign(
        {
          _id: cart._id,
          cantidad:cart.cantidad,
          items:cart.items,
          total:cart.total,
          descripcion:cart.descripcion,
          direccion:cart.direccion,
          totalformateado:cart.totalformateado,
          descuento:cart.descuento ? cart.descuento : null,
          shipping:cart.shipping,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d'
        }
      );

      res.json({"res":true,result:updatedCart,token:token1})
    }
    static deleteItemsAllCart= async(req,res)=>{
      const token=req.headers.tokencart;
      const tokendecode=jwt.decode(token);

      const id=tokendecode._id;
      const deleteCart = await Cart.deleteOne({_id:id});
      if(tokendecode.descuento){
        const idDescuento = tokendecode.descuento._id;
        const response = await GiftCard.findByIdAndUpdate(idDescuento,{validater:true});
      }
      if(deleteCart){
        res.json({"res":true});
      }else{
        res.json({"res":false});
      }
    }
}
module.exports = CartController;