const jwt = require('jsonwebtoken');

exports.decodetoken = (token)=>{
   const decode = jwt.decode(token);
   return decode;
}