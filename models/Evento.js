const { Schema, model } = require('mongoose');

const EventoSchema = new Schema({
    title:String,
    user:String,
    dateInit:String,
    dateEnd:String,
    color:String,
    description:String,
    typeEvent:String,
    data:Object,
},{
    timestamps:true,
})

module.exports = model('Evento',EventoSchema);