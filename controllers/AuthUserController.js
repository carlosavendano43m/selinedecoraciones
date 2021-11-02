const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { errorHandler } = require('../helpers/dbErrorHandling');

class AuthUserController{

    static checkEmail = async(req,res)=>{
      const email = req.params.email;
      const response = await User.findOne({email:email});

      if(response){
        res.status(200).json({isExist:true});
      }else{
        res.status(200).json({isExist:false});
      }
      
    }

   static singin = async (req,res) => {
      const { email, password } = req.body;
     
      const errors = validationResult(req); 
     
      if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(422).json({
          errors: firstError
        });
      }else{
        // check if user exist
        User.findOne({
          email
        }).exec((err, user) => {
 
          if (err || !user) {
            return res.status(400).json({
              errors: 'El usuario con ese correo electrónico no existe. Por favor regístrese'
            });
          }
          // authenticate
          if (!user.authenticate(password)) {
            return res.status(400).json({
              errors: 'Correo electrónico y contraseña no coinciden'
            });
          }
          // generate a token and send to client
          const token = jwt.sign(
            {
              _id: user._id,
              nombre:user.nombre,
              apellido:user.apellido,
              email:user.email,
              role:user.role,
              telefono:user.telefono,
              descripcion:user.descripcion,
              avatar:user.avatar,
              montoTotalOrden:user.montoTotalOrden ? user.montoTotalOrden:0,
              cantidadOrden:user.cantidadOrden ? user.cantidadOrden:0
            },
            process.env.JWT_SECRET,
            {
              expiresIn: '7d'
            }
          );

          return res.status(200).json({
            token
          });
        });

      }


   }

   static singup = async(req,res) =>{
    const { nombre,apellido, email,rut, password } = req.body;
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
      const firstError = errors.array().map(error => error.msg)[0];
      return res.status(422).json({
        errors: firstError
      });
    } else {

      User.findOne({
        email
      }).exec((err, user) => {
        if (user) {
          return res.status(400).json({
            errors: 'Email esta en uso'
          });
        }
      });

      const token = jwt.sign(
        {
          nombre,
          apellido,
          email,
          rut,
          password
        },
        process.env.JWT_ACCOUNT_ACTIVATION,
        {
          expiresIn: '5m'
        }
      );

      if(token){

        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
          if (err) {
            console.log('Activation error');
            return res.status(401).json({
              errors: 'Expired link. Signup again'
            });
          }else {

            const { nombre, apellido, email, rut, password } = jwt.decode(token);

            const user = new User({
              nombre, 
              apellido,
              email,
              rut,
              password
            });

            user.save((err, user) => {
              if (err) {
                return res.status(401).json({
                  errors: errorHandler(err)
                });
              } else {
                return res.json({
                  "res": true,
                  data: user,
                  title: 'Registro exitoso',
                  message: 'Registro exitoso'
                });
              }
            });

          }
        })

      }else{
        return res.json({
          message: 'ocurre un error por favor intente nuevamente'
        });
      }
      
    
    }

   }


  static activation = async(req,res)=>{

    const { token } = req.body;

    if (token) {
      jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
        if (err) {
          console.log('Activation error');
          return res.status(401).json({
            errors: 'Enlace caducado. Regístrese de nuevo'
          });
        } else {
          const { nombre, apellido, email, password } = jwt.decode(token);
  
          console.log(email);
          const user = new User({
            nombre,
            apellido,
            password
          });
  
          user.save((err, user) => {
            if (err) {
              console.log('Save error', errorHandler(err));
              return res.status(401).json({
                errors: errorHandler(err)
              });
            } else {
              return res.json({
                success: true,
                message: user,
                message: 'Registro exitoso'
              });
            }
          });
        }
      });
    } else {
      return res.json({
        message: 'ocurre un error por favor intente nuevamente'
      });
    }

   }

   static forgotPassword = async(req,res)=>{
    const { email } = req.body;
    console.log(email);
    res.json({email:email});
   }

   static refreshUser = async (req,res)=>{
     const {token}=req.body;
  
     const userDecode=jwt.decode(token);
     //console.log(userDecode);
     const id=userDecode._id;
     const user=await User.findById(id);
     const userData = jwt.sign(
        {
          _id: user._id,
          nombre:user.nombre,
          apellido:user.apellido,
          email:user.email,
          role:user.role,
          telefono:user.telefono,
          descripcion:user.descripcion,
          direccion:user.direccion,
          avatar:user.avatar,
          montoTotalOrden:user.montoTotalOrden ? user.montoTotalOrden:0,
          cantidadOrden:user.cantidadOrden ? user.cantidadOrden:0
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d'
        }
      );
     res.status(200).json({"token":userData});
   }

   static saveDevice = async (req,res)=>{
     const data = req.body;
     const id= data.user._id;
     const user = await User.findById(id);
     if(user){
        const dispositivo = user.dispositivo;
        const device = user.dispositivo.find(x=>x.endpoint === data.device.endpoint);
        if(!device){
          dispositivo.push(data.device);
        }
        await User.findByIdAndUpdate(id,{dispositivo});
     }

     res.status(200).json({"res":true});
   }


}


module.exports = AuthUserController;