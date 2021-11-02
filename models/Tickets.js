const { Schema, model } = require('mongoose');

const TicketSchema = new Schema({
    asunto:String,
    orden:String,
    descripcion:String,
    motivo:String,
    tipo:String,
    estado:String,
    response:Array,
    fechaenvio:String,
    fechaactualizacion:String,
},{
    timestamps:true,
})


module.exports = model('Ticket',TicketSchema);