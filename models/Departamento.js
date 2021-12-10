const { Schema, model } = require('mongoose');

const DepartamentoSchema = new Schema({
    titulo:String,
    img:String,
    url:String,
},{
    timestamps:true,
})

module.exports = model('Departamento',DepartamentoSchema);