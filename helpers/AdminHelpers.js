const User=require('../models/User');
const Notificacion = require('../models/Notificacion');
const {fechaformateada}=require('./formato');
exports.notificationAdmin = async(data)=>{
    const usersAdmin = await User.find({role:"admin"});
    const fecha = new Date();
    let notification = {};

    usersAdmin.forEach(async element => {
        notification = {
            id:element._id,
            titulo:data.titulo,
            descripcion:data.descripcion,
            icon:data.icon,
            iconcolor:data.iconcolor,
            tipo:data.tipo,
            leido:true,
            fecha:fechaformateada(fecha,'LLLL'),
            url:data.url
        }
        let modelNotification = new Notificacion(notification);
        await modelNotification.save();
    });

    return true;
}

class AdminHelper {

}