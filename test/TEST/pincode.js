const express = require("express");
const sql = require("mssql");

const app = express();
app.use(express.json());

/* =====================================================
   DB CONFIG
===================================================== */
const dbConfig = {
  user: "kiran",
  password: "Neuberg@123",
  server: "10.100.6.60",
  port: 1433,
  database: "webhookdb",
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

/* =====================================================
   DB CONNECTION (SINGLETON)
===================================================== */
async function getDbPool() {
  try {
    if (pool) return pool;
    pool = await sql.connect(dbConfig);
    console.log("✅ SQL Server connected");
    return pool;
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    throw err;
  }
}

/* =====================================================
   GET BRANCH DETAILS BY PINCODE
===================================================== */
app.all("/GetBranchDetailsByPincode", async (req, res) => {
  try {
    const pincode = req.query.pincode;

    if (!pincode || !pincode.trim()) {
      return res.status(400).json({
        d: {
          result: [],
          message: "pincode query parameter is required"
        }
      });
    }

    const pool = await getDbPool();

    const result = await pool.request()
      .input("Pincode", sql.NVarChar(10), pincode.trim())
      .query(`
        SELECT
          Pincode,
          AreaId,
          AreaName,
          CityName,
          CityId,
          BranchId,
          BranchName,
          IsHomeVisitApplicable,
          Latitude,
          Longitude
        FROM dbo.AreaBranchMaster
        WHERE LTRIM(RTRIM(Pincode)) = @Pincode
      `);

    /* 🔴 NO DATA FOUND → SAME FORMAT */
    if (result.recordset.length === 0) {
      return res.json({
        d: {
          result: []
        }
      });
    }

    /* ✅ DATA FOUND → SAME FORMAT */
    const formattedResult = result.recordset.map(r => ({
      Pincode: r.Pincode,
      AreaId: r.AreaId,
      AreaName: r.AreaName,
      CityName: r.CityName,
      CityId: r.CityId,
      BranchId: r.BranchId,
      BranchName: r.BranchName,
      IsHomeVisitApplicable: r.IsHomeVisitApplicable ? "1" : "0",
      Latitude: r.Latitude ? r.Latitude.toString() : null,
      Longitude: r.Longitude ? r.Longitude.toString() : null
    }));

    res.json({
      d: {
        result: formattedResult
      }
    });

  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({
      d: {
        result: [],
        error: err.message
      }
    });
  }
});


/* =====================================================
   HEALTH CHECK
===================================================== */
app.get("/", (req, res) => {
  res.send("🚀 AreaBranch API is running");
});

/* =====================================================
   START SERVER
===================================================== */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
