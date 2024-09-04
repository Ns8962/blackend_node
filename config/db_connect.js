const mysql2 =  require('mysql2/promise');
const connectDB = async()=>{
    try{
       return await mysql2.createConnection({
            host : '127.0.0.1',
            user : 'root',
            password : '',
            database : 'restaurant_backend'
       })
    }catch(err){
        console.log('connect error 500');
    }
    console.log('connected');
}

module.exports = connectDB;