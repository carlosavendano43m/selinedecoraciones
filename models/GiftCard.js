const { Schema, model } = require('mongoose');

const GiftCardSchema = new Schema({
    name:String,
    code:String,
    value:Number,
    img:String,
    description:String,
    state:Boolean,
    dateInit:String,
    dateEnd:String,
    validater:Boolean,
    userId:String,
    data:Array,
},{
    timestamps:true,
})


module.exports = model('GiftCard',GiftCardSchema);