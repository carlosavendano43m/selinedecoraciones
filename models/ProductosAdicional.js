const { Schema, model } = require('mongoose');

const ProductosAdicionalSchema = new Schema({
    titulo:String,
    portada:String,
    precio:Number
},{
    timestamps:true,
})

module.exports = model('ProductosAdicional',ProductosAdicionalSchema);