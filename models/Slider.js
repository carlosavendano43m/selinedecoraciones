const { Schema, model } = require('mongoose');

const SliderSchema = new Schema({
    titulo:String,
    description:String,
    img:Array,
    link:String,
    animation:String,
    btn:Object
},{
    timestamps:true,
})


module.exports = model('Slider',SliderSchema);