const sql = require("mssql");

const dbConfig = {
  user: "kiran",
  password: "Neuberg@123",
  server: "10.100.6.60",
  port: 1433,
  database: "webhookdb",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};

async function checkDbConnection() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("✅ Database connected successfully!");
    return pool;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
}

checkDbConnection();
