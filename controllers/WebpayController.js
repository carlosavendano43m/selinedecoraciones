
const WebpayPlus = require("transbank-sdk").WebpayPlus;
const axios = require('axios');
////////////// helpers /////////////////
const {getRandomInt,getRandomString,fechaformateada} = require('../helpers/formato');
const {sendNotification} = require('../helpers/WebPush');
const {getProducto,discountQuality} = require('../helpers/Stock');
/////////// models ////////////////////
const tokenWebpay=require('../models/tokenWebpay');
const Orden=require('../models/Orden');
const User=require('../models/User');
const GiftCard=require('../models/GiftCard');
const Notificacion = require('../models/Notificacion');

class WebpayController {
    static InitTransaction = async(req,res)=>{

        const buyOrder=getRandomInt(100000, 999999999); 
        const sessionId="selinestore";
        const amount = req.body.amount;
        let data=req.body;
      
        const returnUrl = "http://" + req.get("host")+ '/webpay-return';
     
        const response = await WebpayPlus.Transaction.create(buyOrder, sessionId, amount, returnUrl);

        if(response){
            data.orden = buyOrder;
            data.token = response.token;
            data.currency = 'CLP';
            data.url = `${response.url}?token_ws=${response.token}`;

            const fecha = new Date();
            const date = fechaformateada(fecha,'L').split('/').join('-');
            let total = 0;
            let valorcurrency=0;
            let resq;
            if(fecha.getDay() !== 6 && fecha!==0){
                resq = await axios.get(`https://mindicador.cl/api/dolar/${date}`);
                valorcurrency = resq.data.serie[0].valor;
            }else {
                resq = await axios.get(`https://mindicador.cl/api`);
                valorcurrency = resq.data.dolar.valor;
            }
           
            total = Math.ceil((amount/valorcurrency));
            data.amountUsd = total;
        
            const model=new tokenWebpay(data);
            const save = await model.save();
  
            if(save){
                res.status(200).json({
                    token:response.token,
                    url: data.url,
                    result:''
                });
            }else{
                res.status(400).json({"res":false,"title":"Error al guardar token","message":"Error al guardar token WebpayPlus"})
            }

        }else{
            res.status(400).json({"res":false,"title":"Error de token","message":"Error al obtener token WebpayPlus"})
        }
        
    }

    static returnTransaction = async(req,res)=>{

        const data = await tokenWebpay.findOne().sort({'_id': -1}).limit(1);
        
        let orden = {
            "orden":data.orden,
            "token":data.token,
            "user":data.user,
            "items":data.cart,
            "discount":data.discount,
            "direction":data.direction,
            "shipping":data.shipping,
            "currency":data.currency,
            "typePayment":data.typePayment,
            "total":data.amount,
            "totalUsd":data.amountUsd,
        }
        console.log(data);
        const status = await WebpayPlus.Transaction.status(data.token);
        const response = await WebpayPlus.Transaction.commit(data.token).catch(error=>{
            return null;
        });

        let tracking="";
        let estado="";
        let estatus=[];
        let transaction;
        const fecha=new Date();
        if(response){
            
            if(response.response_code === 0){
                tracking = getRandomString(11).toLocaleUpperCase();
                estado = "Pedido realizado";
                
                estatus = [{
                    name:"Pedido Realizado",
                    date:fechaformateada(fecha,'LLLL').slice(0,-6),
                    hours:fechaformateada(fecha,'LT'),
                }];
                if(data.user._id){
                    const user= await User.findByIdAndUpdate(data.user._id);
                    const montoTotal = user.montoTotalOrden ? user.montoTotalOrden+data.amount:data.amount;
                    const users= await User.findByIdAndUpdate(data.user._id,{ montoTotalOrden:montoTotal,$inc: {cantidadOrden:1}});
                }
                /////////////// desactivar gift card //////////////////
                if(data.discount){
                    const idGift = data.discount._id;
                    const response = await GiftCard.findById(idGift,{state:false});
                }
                //////////// disminuir cantidad de productos en stock /////
                let qualityProduct = 0;
                let qualityStock = 0;
                let idProduct;
                let products;
                data.cart.items.forEach(async element=>{
                    idProduct = await element.id;
                    qualityProduct = await element.cantidad;
                  
                    products = await getProducto(idProduct);
                    console.log(products)
                    
                    console.log('stock',qualityProduct);
                    if(products){
                        console.log("paso por aqui")
                        qualityStock = await products.cantidad-qualityProduct;
                        console.log('cantidad',qualityProduct);
                        await discountQuality(idProduct,qualityStock);
                    }
                    
                })
            }else{
                estado = "Pendiente";
            }
            transaction = response;
        }else{
            estado = "Cancelado";
            transaction = status;
            transaction.response_code = null;
        }
        orden.tracking = tracking;
        orden.estado = estado;
        orden.status = estatus;
        orden.transaction = transaction;

        
        const ordenExist = await Orden.findOne({"token":data.token});
    
        if(!ordenExist){
            const model = new Orden(orden);
            await model.save();
        }
    
        if(estado === "Pedido realizado"){
            const usersAdmin = await User.find({role:"admin"});
            const device = usersAdmin.map(x=>x.dispositivo);
            const user= await User.findByIdAndUpdate(data.user._id);
            const body = user ? `Usuario ${user.nombre} ${user.apellido} ha realizado una compra`:'Invitado ha realizado una compra';
            const payloadData = {
                title:`Orden # ${orden.transaction.buy_order}, mediante Webpay`,
                body:body,
                actionTitle:`Ir a orden`
            }
            let notification = {}
            usersAdmin.forEach(async element => {
                notification = {
                    id:element._id,
                    titulo:payloadData.title,
                    descripcion:body,
                    icon:'local_mall',
                    iconcolor:'text-success',
                    tipo:'Ventas',
                    leido:true,
                    fecha:fechaformateada(fecha,'LLLL'),
                    url:'/admin/orden'
                }
                let modelNotification = new Notificacion(notification);
                await modelNotification.save();
            });
            device.forEach(element => {
                if(element.length > 1){
                    element.forEach(async x=>{
                        await sendNotification(x,payloadData);
                    })
                }
            });
        
            res.redirect(`http://localhost:4200/checkout-review/${data.token}`);
        }else{
            res.redirect('http://localhost:4200/checkout-payment/');
        }
        
    }
}

module.exports = WebpayController;