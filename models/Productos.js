const { Schema, model } = require('mongoose');

const ProductosSchema = new Schema({
    cantidad:Number,
    categoria:String,
    subcategoria:String,
    precio:Number,
    descuentos:Number,
    marcas:String,
    material:Array,
    otrasCaracteristicas:Array,
    titulo:String,
    imagenproductos:Array,
    imagenproductosOptimizada:Array,
    referencia:String,
    descripcion:String,
    posicion:Number,
    estado:Boolean,
    tallas:Array,
    colores:Array,
    codigo:String,
    transporte:Object,
    ratings:Number,
    ratingscantidad:Number,
    tipodepedido:String,
    agendado:Object,
    adicional:Array,
    tags:Array,
    visitas:Number,
},{
    timestamps:true,
})


module.exports = model('Productos',ProductosSchema);