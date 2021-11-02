const { Schema, model } = require('mongoose');

const MarcasSchema = new Schema({
    nombre:String,
    logo:String,
    descripcion:String,
},{
    timestamps:true,
})


module.exports = model('Marcas',MarcasSchema);