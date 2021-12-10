const { Schema, model } = require('mongoose');

const RatingsSchema = new Schema({
    id:String,
    nombre:String,
    email:String,
    calificacion:Number,
    comentarios:String,
    pros:String,
    contras:String,
    like:Number,
    dislike:Number,
    avatar:String,
    fecha:String,
},{
    timestamps:true,
})


module.exports = model('Ratings',RatingsSchema);