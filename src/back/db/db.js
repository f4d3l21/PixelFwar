const mariadb = require('mariadb');

const db = mariadb.createPool({
    host: 'localhost', 
    user: 'root', 
    password: 'root',
    database: 'pixeldb'
});

async function DbConnection() {
    let con;
    try {
      con = await db.getConnection();
      console.log("Connected to the database!");
      console.log("Database connection test successful!");

    } catch (error) {
      console.error("Error connecting to the database:", error);
    } finally {
      if (con) con.release(); 
    }
  }
  

module.exports = db;

DbConnection();