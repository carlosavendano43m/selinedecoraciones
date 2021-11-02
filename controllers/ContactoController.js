const Contacto= require('../models/Contacto');
const {enviarCorreo} = require('../helpers/Nodemailer');

class ContactoController{

    static sendMail = async(req,res)=>{
        const {nombre,email,telefono,asunto,mensaje}=req.body;
        const r=enviarCorreo(nombre,email,telefono,asunto,mensaje)
        const contactoModel = new Contacto({nombre,email,telefono,asunto,mensaje});
        const resp=contactoModel.save();
        res.json({"res":true,"message":"Nos pondremos en contacto con usted con la brevedad posible."});
    }

}

module.exports = ContactoController;