const mysql = require('mysql');
export const conn = mysql.createConnection({
    host: "127.0.0.1",
    user: "mysql",
    database: "trades",
    password: "mysql"
});