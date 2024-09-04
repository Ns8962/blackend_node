const db_mysql_re = require('../config/db_connect');
const dv_mysql_mid = require('../config/db_connect_midel');
const bcrypt  =require('bcryptjs');
const axios = require('axios');
const jwt = require('jsonwebtoken');
exports.register = async (req, res)=>{

    try{
      const conn = await db_mysql_re();
      const data = req.body;
      const [find_data] = await conn.query('SELECT user_name FROM m_user WHERE user_name=?', [data.user_name]);

      if(find_data.length>0){
        res.send('Already a user : ' + data.user_name ).status(404);
      }
      if(data.user_name&&data.user_password&&find_data.length<1){
        const salt = await bcrypt.genSalt(10);
        const setHash = await bcrypt.hash(data.user_password, salt);
        const [result] = await conn.query('INSERT INTO m_user (user_name, user_password, status) VALUES (?, ?, ?)', [data.user_name, setHash, 1]); // ใช้ connection ในการ query ข้อมูล
        res.send('Register Success').status(200);
      }else{
        res.send('Require user_name & password').status(404);
      }

    }catch(err){
        console.log('register error 500');
    }
}

exports.login = async (req, res)=> {
    try{
        const data_body = req.body;
        const conn = await db_mysql_re(); // เรียกใช้ฟังก์ชันเพื่อสร้าง connection
        const [rows] = await conn.query('SELECT * FROM m_user WHERE  user_name=?', [data_body.user_name] );
        if(rows.length===0){
            res.send('Not have user/ password').status(404);
        }
        const isMatch = await bcrypt.compare(data_body.user_password, rows[0].user_password); // ใช้ bcrypt password
        if(isMatch){
            
            await saveLog(data_body);
            payLoad(data_body.user_name)
            .then(token => 
                res.send('Login pass \n toKen= ' + token).status(200)
            )
            .catch(err => console.error("Error: ", err));
            // console.log(rows[0]);
        }else{
            res.send('Login Error notMatch').status(200);
        }
    }catch(err){
        console.log('login error 500'+err);
    }
};

exports.edit_user = async(req, res)=> {

    try{

        const id = await req.params.id;
        const data = await req.body;
        const conn  = await db_mysql_re();
        if(data.user_name&&data.user_password&&id){
            const find_data  =  await conn.query('SELECT * FROM m_user WHERE id_user=?',[id]);
            if(find_data.length<1){
                res.send('Not have id : '+ id).status(200);
            }
            const salt = await bcrypt.genSalt(10);
            const setHash = await bcrypt.hash(data.user_password, salt);
            const set_data = await [data.user_name, setHash, id];
            const [row]= await conn.query('UPDATE m_user SET user_name=?, user_password=? WHERE id_user = ?', set_data);
            res.send('Update success').status(200);

        }else{
            res.send('Require id user_name & password').status(200);
        }

    }catch(err){
        console.log('edit_user error 500'+err);
    }
}

exports.logout = async(req, res)=>{
    try{
        const data = await req.body;
        if(data.user_name.length<1){
            res.send('logout failed').status(200);
        }else{

            const conn = await dv_mysql_mid();
            const [row]=  await conn.query('UPDATE login_log SET status=? WHERE user_name=?  ORDER BY id DESC', [0, data.user_name]);
            res.send('logout success').status(200);
        }
    }catch(err){
        console.log( ' logout error 500' +err);
    }
}

const payLoad = async (user)=>{
    const data = await user;
    var payload = await { 
        user:{
            name: data
        }
    }
    return new Promise((resolve, reject) => {
        jwt.sign(payload, 'jwtsecret', { expiresIn:120 /* 10 sec */}, (err, token) =>{
            if (err) {
                reject(err); // หากเกิดข้อผิดพลาด ให้ส่ง reject เพื่อจัดการ error
            } else {
                resolve(token); // ส่งคืน token เมื่อสำเร็จ
            }
        })
    });
}



const saveLog = async (data_body)=>{
    const conn = await dv_mysql_mid();
    try{
        const get_data = await data_body;
        const date_time = await new Date;
        await conn.query('INSERT INTO login_log(user_name, date, status) VALUES (?, ?, ?)',[get_data.user_name, date_time, 1]);
    }catch(err){
        console.log('saveLog error 500 ' + err);
    }
} 
