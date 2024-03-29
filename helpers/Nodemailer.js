
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.NODEMAILER_USERS, // generated ethereal user
    pass: process.env.NODEMAILER_PASSWORD, // generated ethereal password
  },tls:{
      rejectUnauthorized: false
    }
});

exports.enviarCorreo = async function(nombre,email,telefono,asunto,mensaje){
  
  const opciones = {
    from:process.env.NODEMAILER_USERS,
    to:process.env.NODEMAILER_TO,
    subject: asunto,
    text:`
    Nombre: ${nombre}
    Email: ${email}
    Asunto: ${asunto} 
    Telefono: ${telefono}
    mensaje: ${mensaje}
    `
  }

  await transporter.sendMail(opciones,(error,info)=>{

      if(info){
          return true;
      }else{
          console.log(error)
          return false;  
      }
  })

}

