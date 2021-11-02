const { Schema, model } = require('mongoose');

const CartSchema = new Schema({
    id:String,
    items:Array,
    total:Number,
    totalformateado:String,
    cantidad:Number,
    direccion:Object,
    descripcion:String,
    descuentos:Object,
    shipping:Object,

},{
    timestamps:true,
})

module.exports = model('Cart',CartSchema);