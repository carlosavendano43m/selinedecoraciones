const Productos=require('../models/Productos');

exports.getProducto = async function(id){
    const product = await Productos.findById(id);
    return product;
}

exports.discountQuality = async function(id,cantidad){
    const product = await Productos.findByIdAndUpdate(id,{cantidad});
    return product;
}