const express = require("express");
const sql = require("mssql");

const app = express();
app.use(express.json());

const dbConfig = {
    user: "DESKTOP-MUZZAMI\\Administrator",               // FIXED
    password: "",
    server: "DESKTOP-MUZZAMI",
    database: "Testing",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Check DB Connection
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

// Webhook Receiver
app.post("/webhook", async (req, res) => {
    const p = req.body;

    try {
        let pool = await sql.connect(dbConfig);

        await pool.request()
            .input("order_id", sql.VarChar, p.order_id)
            .input("status", sql.VarChar, p.status)
            .input("amount", sql.Decimal(10,2), p.amount)
            .input("currency", sql.VarChar, p.currency)
            .input("customer_name", sql.VarChar, p.customer.name)
            .input("customer_email", sql.VarChar, p.customer.email)
            .input("json_data", sql.NVarChar(sql.MAX), JSON.stringify(p))
            .query(`
                INSERT INTO webhook 
                (order_id, status, amount, currency, customer_name, customer_email, json_data)
                VALUES 
                (@order_id, @status, @amount, @currency, @customer_name, @customer_email, @json_data)
            `);

        res.json({ message: "Webhook JSON saved successfully!" });

    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).send("DB Error");
    }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
