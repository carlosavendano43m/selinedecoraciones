const { Schema, model } = require('mongoose');

const TransporteSchema = new Schema({
    nombre:String,
    logo:String,
    descripcion:String,
    tiempoentrega:String,
    tiempodeenvio:String,
    precio:Number,
    precioformateado:String,
    dimensiones:Array,
    peso:String
},{
    timestamps:true,
})


module.exports = model('Transporte',TransporteSchema);