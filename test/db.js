const sql = require("mssql");

const dbConfig = {
  user: "kiran",
  password: "Welcome@123",
  server: "65.1.209.154",
  database: "SLIMS_UAT",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};

// ============================================
// CHECK DB CONNECTION
// ============================================
async function checkDbConnection() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("✅ SQL Server connected successfully!");
    return pool;
  } catch (err) {
    console.error("❌ Failed to connect DB:", err);
    return null;
  }
}

// Call the function
checkDbConnection();
