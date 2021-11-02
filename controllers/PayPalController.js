const request = require('request');
const axios = require('axios');
/////////// models ////////////////////
const tokenWebpay=require('../models/tokenWebpay');
const Orden=require('../models/Orden');
const User=require('../models/User');
const Paypal=require('../models/Paypal');
const GiftCard=require('../models/GiftCard');
//////////// formatos ///////////////
const {getRandomInt,getRandomString,fechaformateada}=require('../helpers/formato');
const {sendNotification} = require('../helpers/WebPush');
const auth = {user:process.env.PAYPAL_CLIENT_ID,pass:process.env.PAYPAL_SECRET}
class PayPalController{

    static createTransaction = async (req,res)=>{   
        let data = req.body;
        console.log(data)
        const buyOrder=getRandomInt(100000, 999999999);
        const amount = req.body.amount;
        const fecha = new Date();
        const date = fechaformateada(fecha,'L').split('/').join('-');
        let total = 0;
        ///console.log(req.body);
        let resq;
        let valorcurrency=0;
        if(fecha.getDay() !== 6 && fecha!==0){
            resq = await axios.get(`https://mindicador.cl/api/dolar/${date}`);
            valorcurrency = resq.data.serie[0].valor;
        }else {
            resq = await axios.get(`https://mindicador.cl/api`);
            valorcurrency = resq.data.dolar.valor;
        }
       
        total = Math.ceil((amount/valorcurrency));
        data.orden = buyOrder;
        data.amount = amount;
        data.amountUsd = total;
        data.currency = 'USD';

        const body = {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD', //https://developer.paypal.com/docs/api/reference/currency-codes/
                    value: total
                }
            }],
            application_context: {
                brand_name: `Seline Decoraciones`,
                landing_page: 'NO_PREFERENCE', // Default, para mas informacion https://developer.paypal.com/docs/api/orders/v2/#definition-order_application_context
                user_action: 'PAY_NOW', // Accion para que en paypal muestre el monto del pago
                return_url: `http://localhost:3443/paypal/execute-payment`, // Url despues de realizar el pago
                cancel_url: `http://localhost:4200/checkout-payment/` // Url despues de realizar el pago
            }
        }

        request.post(`${process.env.PAYPAL_SANDBOX}/v2/checkout/orders`, {
            auth,
            body,
            json: true
        }, async (err, response) => {
            const token = response.body.id;
            data.token = token;
            const link = response.body.links.find(x=>x.method === "GET" && x.rel === "approve");
            const url = link.href;
            data.url = url;

            const model=new tokenWebpay(data);
            const save = await model.save();
    
            res.status(200).json({ token,url,result:'' });
        })
    }

    static  executePayment = async (req, res) => {
        const token = req.query.token; //<-----------

        const data = await tokenWebpay.findOne().sort({'_id': -1}).limit(1);
        
        let orden = {
            "orden":data.orden,
            "token":data.token,
            "user":data.user,
            "items":data.cart,
            "direction":data.direction,
            "discount":data.discount,
            "shipping":data.shipping,
            "currency":data.currency,
            "typePayment":data.typePayment,
            "total":data.amount,
            "totalUsd":data.amountUsd,
        }
        //console.log(orden);
        let tracking="";
        let estado="";
        let estatus=[];
        let transaction;
        request.post(`${process.env.PAYPAL_SANDBOX}/v2/checkout/orders/${token}/capture`, {
            auth,
            body: {},
            json: true
        },async (err, response) => {
            const fecha = new Date();
            const date = fechaformateada(fecha,'L').split('/');
            const paypalResponse = {
                data:response.body
            };
            const modelPaypal = new Paypal(paypalResponse);
            await modelPaypal.save();
            if(response.body.status === "COMPLETED"){
                tracking = getRandomString(11).toLocaleUpperCase();
                estado = "Pedido realizado";
                estatus = [{
                    name:"Pedido Realizado",
                    date:fechaformateada(fecha,'LLLL').slice(0,-6),
                    hours:fechaformateada(fecha,'LT'),
                }];
                transaction={
                    vci:"TSY",
                    amount:orden.total,
                    status:response.body.status,
                    buy_order:orden.orden,
                    accounting_date:"0721",
                    transaction_date:response.body.purchase_units[0].payments.captures[0].create_time,
                    authorization_code:`${date[1]}${date[2].substr(-2,2)}`,
                    payment_type_code:"VD",
                    response_code:0,
                    installments_amount:0,
                    installments_number:0
                }
                orden.tracking = tracking;
                orden.estado = estado;
                orden.status = estatus;
                orden.transaction = transaction;

                const ordenExist = await Orden.findOne({"token":data.token});
    
                if(!ordenExist){
                    const model = new Orden(orden);
                    const dataModel=await model.save();
                }
                if(data.discount){
                    const idGift = data.discount._id;
                    const response = await GiftCard.findById(idGift,{state:false});
                }
        

                if(estado === "Pedido realizado"){
                    const usersAdmin = await User.find({role:"admin"});
                    const device = usersAdmin.map(x=>x.dispositivo);
                    const user= await User.findByIdAndUpdate(data.user._id);
                    const montoTotal = user.montoTotalOrden ? user.montoTotalOrden+data.amount:data.amount;
                    const users= await User.findByIdAndUpdate(data.user._id,{ montoTotalOrden:montoTotal,$inc: {cantidadOrden:1}});
                    const body = user ? `Usuario ${user.nombre} ${user.apellido} ha realizado una compra`:'Invitado ha realizado una compra';
                    const payloadData = {
                        title:`Orden # ${orden.transaction.buy_order}, mediante Paypal`,
                        body:body,
                        actionTitle:`Ir a orden`
                    }
                    device.forEach(element => {
                        if(element.length > 1){
                            element.forEach(x=>{
                                sendNotification(x,payloadData);
                            })
                        }
                    });
                
                    res.redirect(`http://localhost:4200/checkout-review/${data.token}`);
                }else{
                    res.redirect('http://localhost:4200/checkout-payment/');
                }
            }

            //res.json({ data: response.body })
        })
    }

    static cancelPayment = async (req,res) => {
        
    }

}

module.exports = PayPalController;