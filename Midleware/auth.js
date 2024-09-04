const dv_mysql_mid = require('../config/db_connect_midel');
const jwt = require('jsonwebtoken'); // เรียก json
exports.authLogin = async (req, res, next)=>{
    const conn = await dv_mysql_mid();
    const data = req.body;
    try{
       const [item] =  await conn.query('SELECT status FROM login_log WHERE user_name=? AND status=1 ORDER BY id DESC',[data.user_name]);
       if(item.length<1){
            next();
       }else{
            res.send('user unavailable !').status(404);
       }
    }catch(err){
        console.log('auth error 500 '+err);
    }
}

exports.authToken = async(req, res, next)=>{
    const token = await req.headers["authtoken"];//รับ token จากหน้าบ้าน ชื่อ authtoken
    const data = req.body;
    try{
        if(!token){ // ถ้าไม่มี token 
            res.status(401).send('no token');
            return 0;
        }
        const decoded = await jwt.verify(token, 'jwtsecret'); // verify token ที่ส่งมา
        next();
    }catch(err){
        // console.log('authToken error '+ err);
        await kickUser(data.user_name);
        res.send('Expire login').status(401);
    }
}


const kickUser = async (user)=>{
    try{
        const conn  = await dv_mysql_mid();
        await conn.query('UPDATE login_log SET status=? WHERE user_name=?  ORDER BY id DESC', [0, user]);
    }catch(err){
        console.log('kickUser error '+ err);
    }
}