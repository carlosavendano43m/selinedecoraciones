const { Schema, model } = require('mongoose');

const ImgSchema = new Schema({
    fieldname: String,
    encoding: String,
    mimetype: String,
    filename: String,
    path: String,
    size: String
},{
    timestamps:true,
})

module.exports = model('Img',ImgSchema);