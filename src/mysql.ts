let express    = require('express');
let my_sql = require('promise-mysql');
let mysql      = express.Router();

mysql.pool = my_sql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'root',
    port	 : 3306,
    password : 'shenkarYoker5',
    database : 'dashboard'
});

module.exports = mysql;