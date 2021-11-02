const { Schema, model } = require('mongoose');

const CatalogoSchema = new Schema({
    titulo:String,
    portada:String,
    pdf:String,
    issuu:String,
    descripcion:String,
},{
    timestamps:true,
})

module.exports = model('Catalogo',CatalogoSchema);