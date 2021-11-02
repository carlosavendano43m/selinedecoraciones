const { Schema, model } = require('mongoose');


const ContactoSchema = new Schema({
    nombre:String,
    email:String,
    telefono:String,
    asunto:String,
    mensaje:String,
    estado:{ 
        type:Boolean, 
        default:true
    }
},{
    timestamps:true,
})


module.exports = model('Contacto',ContactoSchema);