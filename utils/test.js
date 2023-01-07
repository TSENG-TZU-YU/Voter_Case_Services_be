// get the client
const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createConnection({
  host: '192.168.5.112',
  user: 'admin',
  database: 'voter_service',
  password:"12345"
});

// simple query
connection.query(
  'SELECT * FROM application_category',
  function(err, results, fields) {
    console.log(results); // results contains rows returned by server
    // console.log(fields); // fields contains extra meta data about results, if available
  }
);