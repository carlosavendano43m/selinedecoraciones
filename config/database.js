const mongoose = require('mongoose');

const connectDB = async()=>{
   await mongoose.connect(process.env.DB_URL,{
    useNewUrlParser:true,
    useFindAndModify:false,
    useUnifiedTopology: true,
    useCreateIndex: true
    }).then(db => console.log('Database esta conectada')).catch(err => console.log(err));
}


module.exports = connectDB;