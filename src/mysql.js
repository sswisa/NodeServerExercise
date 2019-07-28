var express = require('express');
var my_sql = require('promise-mysql');
var mysql = express.Router();
mysql.pool = my_sql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'shenkarYoker5',
    database: 'dashboard'
});
module.exports = mysql;
//# sourceMappingURL=mysql.js.map