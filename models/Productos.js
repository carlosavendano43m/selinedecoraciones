const { Schema, model } = require('mongoose');

const ProductosSchema = new Schema({
    id:String,
    cantidad:Number,
    categoria:String,
    departamento:String,
    subcategoria:String,
    precio:Number,
    preciodolar:Number,
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
    tipoventa:String,
    adicional:Array,
    tags:Array,
    visitas:Number,
},{
    timestamps:true,
})


module.exports = model('Productos',ProductosSchema);