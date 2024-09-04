const mysql = require('mysql2/promise');

const connectDB = async ()=>{
   try{
    return await mysql.createConnection({
        host :'127.0.0.1',
        user : 'root',
        password : '',
        database : 'restaurant_midel',
    })

   }catch(err){
    console.log('connect error '+ err);
   }

}

module.exports = connectDB;