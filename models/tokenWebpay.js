const { Schema, model } = require('mongoose');

const tokenWebpaySchema = new Schema({
    orden:String,
    token:String,
    url:String,
    amount:Number,
    amountUsd:Number,
    cart:Object,
    discount:Object,
    direction:Object,
    user:Object,
    shipping:Object,
    currency:String,
    typePayment:String,
},{
    timestamps:true,
})


module.exports = model('tokenWebpay',tokenWebpaySchema);