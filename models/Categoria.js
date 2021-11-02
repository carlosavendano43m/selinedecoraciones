const { Schema, model } = require('mongoose');

const CategoriaSchema = new Schema({
    nombre:String,
    imagen:String,
    referencia:String,
    descripcion:String,
    posicion:Number,
    estado:Boolean,
    childrem:Array,
    url:String,
},{
    timestamps:true,
})


module.exports = model('Categoria',CategoriaSchema);