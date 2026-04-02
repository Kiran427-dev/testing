const express = require("express");
const axios = require("axios");
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
  }
};

let pool;

/* =====================================================
   DB CONNECTION
===================================================== */
async function getDbPool() {
  if (pool) return pool;
  pool = await sql.connect(dbConfig);
  console.log("✅ SQL Server connected");
  return pool;
}

/* =====================================================
   SAVE INCOMING RESPONSE INTO DB
===================================================== */
async function saveAreaBranchResponse(apiResponse) {
  const rows = apiResponse?.d?.result;

  if (!Array.isArray(rows) || rows.length === 0) {
    console.log("⚠ No rows to save");
    return;
  }

  const pool = await getDbPool();

  for (const row of rows) {
    await pool.request()
      .input("Pincode", sql.NVarChar(10), row.Pincode)
      .input("AreaId", sql.Int, row.AreaId)
      .input("AreaName", sql.NVarChar(100), row.AreaName)
      .input("CityId", sql.Int, row.CityId)
      .input("CityName", sql.NVarChar(100), row.CityName)
      .input("BranchId", sql.Int, row.BranchId)
      .input("BranchName", sql.NVarChar(150), row.BranchName)
      .input(
        "IsHomeVisitApplicable",
        sql.Bit,
        row.IsHomeVisitApplicable === "1" ? 1 : 0
      )
      .input(
        "Latitude",
        sql.Decimal(10, 6),
        row.Latitude ? Number(row.Latitude) : null
      )
      .input(
        "Longitude",
        sql.Decimal(10, 6),
        row.Longitude ? Number(row.Longitude) : null
      )
      .query(`
        INSERT INTO dbo.AreaBranchMaster (
          Pincode,
          AreaId,
          AreaName,
          CityId,
          CityName,
          BranchId,
          BranchName,
          IsHomeVisitApplicable,
          Latitude,
          Longitude
        )
        VALUES (
          @Pincode,
          @AreaId,
          @AreaName,
          @CityId,
          @CityName,
          @BranchId,
          @BranchName,
          @IsHomeVisitApplicable,
          @Latitude,
          @Longitude
        )
      `);
  }

  console.log("✅ Incoming response saved into AreaBranchMaster");
}

/* =====================================================
   API: FETCH → SAVE → RETURN SAME RESPONSE
===================================================== */
app.get("/GetBranchDetailsByPincode", async (req, res) => {
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

    /* 🔹 CALL EXTERNAL API (REPLACE URL) */
    const externalResponse = await axios.get(
      "EXTERNAL_API_URL_HERE",
      {
        params: { pincode }
      }
    );

    /* 🔹 SAVE RESPONSE INTO DATABASE */
    await saveAreaBranchResponse(externalResponse.data);

    /* 🔹 RETURN SAME RESPONSE */
    res.json(externalResponse.data);

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
  res.send("🚀 AreaBranch Sync API Running");
});

/* =====================================================
   START SERVER
===================================================== */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});