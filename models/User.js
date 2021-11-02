const { Schema, model } = require('mongoose');
const { stringify } = require('querystring');
const crypto = require('crypto');


const userSchema = new Schema({
    
    nombre:{
      type: String,
      trim: true,
      required: true
    },
    apellido:{
        type: String,
        trim: true,
        required: true
    },
    email:{
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true
    },
    hashed_password: {
        type: String,
        required: true
    },
    salt: String,
    contrasena:String,
    rut: {
      type:String,
      default:''
    },
    role:{
        type: String,
        default: 'suscriptor'
    },
    avatar:{
        type: String,
        default: 'assets/image/avatar/img12.jpg'
    },
    telefono:{
      type: String,
      default: ''
    },
    descripcion:{
      type:String,
      default:''
    },
    dispositivo:Array,
    direccion:Array,
    userNewsletter:{
      type: Boolean,
      default: false
    },
    montoTotalOrden:{
      type:Number,
      default:0,
    },
    cantidadOrden:{
      type:Number,
      default:0,
    },
    estado:{
      type:Boolean,
      default:true
    },
    resetPasswordLink: {
      data: String,
      default: ''
    },
},{
    timestamps:true,
})

// virtual
userSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.contrasena = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// metodos
userSchema.methods = {
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function(password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },

  makeSalt: function() {
    return Math.round(new Date().valueOf() * Math.random()) + '';
  }
};


module.exports = model('User',userSchema);