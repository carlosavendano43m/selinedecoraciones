const { Schema, model } = require('mongoose');

const PaypalSchema = new Schema({
    data:Array,
},{
    timestamps:true,
})


module.exports = model('Paypal',PaypalSchema);