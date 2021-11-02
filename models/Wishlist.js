const { Schema, model } = require('mongoose');

const WishlistSchema = new Schema({
    id:String,
    items:Array,
},{
    timestamps:true,
})

module.exports = model('Wishlist',WishlistSchema);