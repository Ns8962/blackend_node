const express = require('express');
// const connectDB = require('./config/db_connect')
const morgan = require('morgan');
const cors  = require('cors');
const bodyParse = require('body-parser');
const { readdirSync } = require('fs');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParse.json({limit:'10mb'}));

readdirSync('./routes').map((r)=>
    app.use('/api', require('./routes/'+r))
);
app.listen(8000, () => {
    console.log('server runing.....' );
})
