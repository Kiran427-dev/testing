const express = require("express");
const app = express();
const sql = require("mssql");

app.use(express.json());

// ============================================
// POST webhook receiver
// ============================================
app.post("/webhook", async (req, res) => {
  try {
    const payload = req.body;

    // DB connection
    const pool = await checkDbConnection();

    if (pool) {
      await insertAndVerify(pool, payload);
    } else {
      console.log("⚠ Skipping DB operations due to connection failure.");
    }

    res.status(200).json({
      message: "Payload received successfully",
      payload_received: payload,
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// ============================================
// DB CONFIG
// ============================================
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

// ============================================
// CHECK DB CONNECTION
// ============================================
async function checkDbConnection() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("✅ SQL Server connected!");
    return pool;
  } catch (err) {
    console.error("❌ Failed to connect DB:", err.message);
    return null;
  }
}

// ============================================
// INSERT DATA INTO DB
// ============================================
async function insertAndVerify(pool, payload) {
  try {

    // 🔹 INSERT ONLY status, currency, customer_name, customer_email INTO webhook
    await pool.request()
      .input("order_id", sql.VarChar, payload.order_id)
      .input("status", sql.VarChar, payload.status)
      .input("amount", sql.Decimal(10, 2), payload.amount)
      .input("currency", sql.VarChar, payload.currency)
      .input("customer_name", sql.VarChar, payload.customer.name)
      .input("customer_email", sql.VarChar, payload.customer.email)
      .query(`
        INSERT INTO visitpatient 
        (order_id,status,amount, currency, customer_name, customer_email)
        VALUES 
        (@order_id,@status,@amount, @currency, @customer_name, @customer_email)
      `);

    // 🔹 INSERT order_id & amount INTO webhookamount
    await pool.request()
      .input("order_id", sql.VarChar, payload.order_id)
      .input("amount", sql.Decimal(10, 2), payload.amount)
      .query(`
        INSERT INTO webhookamount 
        (order_id, amount)
        VALUES 
        (@order_id, @amount)
      `);
     // 🔹 INSERT order_id & amount INTO customerdetails
    await pool.request()
      .input("order_id", sql.VarChar, payload.order_id)
      .input("customer_name", sql.VarChar, payload.customer.name)
      .input("customer_email", sql.VarChar, payload.customer.email)
      .query(`
        INSERT INTO customerdetails
        (order_id, customer_name, customer_email)
        VALUES 
        (@order_id, @customer_name, @customer_email)
      `);
    console.log("✔ Inserted into visitpatient and webhookamount and customerdetail!");

  } catch (err) {
    console.error("❌ DB Error:", err.message);
  }
}

// ============================================
// START SERVER
// ============================================
app.listen(3000, () => {
  console.log(" Server running: http://localhost:3000/webhook");
});