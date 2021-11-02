const { Schema, model } = require('mongoose');


const ordenSchema = new Schema({
    id:String,
    token:String,
    user:Object,
    items:Object,
    transaction:Object,
    direction:Object,
    discount:Object,
    total:Number,
    totalUsd:Number,
    shipping:Object,
    costodeenvio:Number,
    costodeenvioformateado:String,
    cantidadtotal:Number,
    tracking:String,
    estado:String,
    status:Object,
    currency:String,
    typePayment:String,
},{
    timestamps:true,
})

module.exports = model('Orden',ordenSchema);