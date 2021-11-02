var moment = require('moment');
moment.locale('es'); 
exports.rut = function(){

}
exports.formateadordemiles = (num)=>{
    if(!isNaN(num)){
      num = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g,'$1.');
      num = num.split('').reverse().join('').replace(/^[\.]/,'');
    }
    return num;
}
exports.fechaformateada = (date,formato)=>{
    const fecha=moment(date).format(formato);
    return fecha;
}
exports.getRandomInt = (min,max)=>{
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
exports.getRandomString = (longitud)=>{
  charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var randomString = '';
  for (var i = 0; i < longitud; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
}