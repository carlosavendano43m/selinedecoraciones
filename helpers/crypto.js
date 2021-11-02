const crypto = require('crypto');
exports.encryptPassword = (salt,password)=> {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
}
exports.decodecrypPassword = (salt,password)=> {
  if (!password) return '';
    try {
      return null;
      
    } catch (err) {
      return '';
    }
}
exports.makeSalt = ()=> {
    return Math.round(new Date().valueOf() * Math.random()) + '';
}