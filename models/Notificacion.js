const { Schema, model } = require('mongoose');

const NotificacionSchema = new Schema({
    id:String,
    titulo:String,
    descripcion:String,
    icon:String,
    iconcolor:String,
    tipo:String,
    leido:Boolean,
    url:String,
    fecha:String,
},{
    timestamps:true,
})


module.exports = model('Notificacion',NotificacionSchema);