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
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

/* =====================================================
   DB CONNECTION (SINGLE POOL)
===================================================== */
async function getDbPool() {
  if (pool) return pool;

  try {
    pool = await sql.connect(dbConfig);
    console.log("✅ SQL Server connected");
    return pool;
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    pool = null;
    throw err;
  }
}

/* =====================================================
   SEND DATA TO LIMS
===================================================== */
async function sendToLims(url, headers, payload) {
  try {
    const response = await axios.post(url, payload, { headers });
    return response.data;
  } catch (err) {
    return {
      IsSuccess: false,
      Error: err.response?.data || err.message
    };
  }
}

/* =====================================================
   INSERT INTO VisitDetails
===================================================== */
async function insertVisitDetails(limsResponse) {
  const pool = await getDbPool();

  const data = limsResponse?.Success?.Data;
  if (!data) throw new Error("Invalid LIMS Success.Data");

  const VisitId = parseInt(data.VisitId, 10);
  const CityId = parseInt(data.CityId, 10);
  const BranchId = parseInt(data.BranchId, 10);

  if (!Number.isInteger(VisitId))
    throw new Error(`VisitId missing or invalid: ${data.VisitId}`);
  if (!Number.isInteger(CityId))
    throw new Error(`CityId missing or invalid: ${data.CityId}`);
  if (!Number.isInteger(BranchId))
    throw new Error(`BranchId missing or invalid: ${data.BranchId}`);

  const RegistrationDate = data.RegistrationDate
    ? new Date(data.RegistrationDate)
    : new Date();

  const CollectionDateTime = data.CollectionDateTime
    ? new Date(data.CollectionDateTime)
    : new Date();

  const VisitBookedBy = String(data.VisitBookedBy || "SYSTEM").substring(0, 50);
  const Address = String(data.Address || "NA").substring(0, 250);
  const MobileNo = data.MobileNo || null;
  const Status = data.Status || "N";
  const VisitCategory = data.VisitCategory || null;

  // ✅ FIXED REGISTEREDBY
  //const RegisteredBy =
    //typeof data.RegisteredBy === "string" && data.RegisteredBy.trim().length > 0
      //? data.RegisteredBy.trim().substring(0, 50)
     // : "SYSTEM";

  const AreaId = data.AreaId ?? null;
  const NetAmount = data.NetAmount ?? 0;
  const TotalAmount = data.TotalAmount ?? 0;
  const DiscountAmount = data.DiscountAmount ?? 0;

  console.log("📥 INSERTING VisitDetails:", {
    VisitId,
   // RegisteredBy
  });

  await pool.request()
    .input("VisitId", sql.Int, VisitId)
    .input("RegistrationDate", sql.DateTime, RegistrationDate)
    .input("CollectionDateTime", sql.DateTime, CollectionDateTime)
    .input("VisitBookedBy", sql.VarChar(50), VisitBookedBy)
    .input("Address", sql.VarChar(250), Address)
    .input("CityId", sql.Int, CityId)
    .input("AreaId", sql.Int, AreaId)
    .input("MobileNo", sql.VarChar(15), MobileNo)
    .input("BranchId", sql.Int, BranchId)
    .input("Status", sql.VarChar(5), Status)
    .input("VisitCategory", sql.VarChar(10), VisitCategory)
    .input("NetAmount", sql.Decimal(18, 2), NetAmount)
    .input("TotalAmount", sql.Decimal(18, 2), TotalAmount)
    .input("DiscountAmount", sql.Decimal(18, 2), DiscountAmount)
    //.input("RegisteredBy", sql.VarChar(50), RegisteredBy)
    .input("CreatedBy", sql.VarChar(20), "AUTO")
    .input("CreatedFrom", sql.VarChar(20), "Admin")
    .query(`
      INSERT INTO VisitDetails (
        VisitId,
        RegistrationDate,
        CollectionDateTime,
        VisitBookedBy,
        Address,
        CityId,
        AreaId,
        MobileNo,
        BranchId,
        Status,
        VisitCategory,
        NetAmount,
        TotalAmount,
        DiscountAmount,
        CreatedBy,
        CreatedFrom
      )
      VALUES (
        @VisitId,
        @RegistrationDate,
        @CollectionDateTime,
        @VisitBookedBy,
        @Address,
        @CityId,
        @AreaId,
        @MobileNo,
        @BranchId,
        @Status,
        @VisitCategory,
        @NetAmount,
        @TotalAmount,
        @DiscountAmount,
        @CreatedBy,
        @CreatedFrom
      )
    `);

  console.log("✅ VisitDetails inserted successfully → VisitId:", VisitId);
}


/* =====================================================
   API ENDPOINT (FULL FLOW)
===================================================== */
app.post("/SaveThirdPartyVisitDetails", async (req, res) => {
  try {
    const limsUrl =
      " https://lims.neubergdiagnostics.com/slimsuat.api/api/public/public/SaveThirdPartyVisitDetails";

    const headers = {
      userid: 7,
      password: "Agile@12345",
      "Content-Type": "application/json"
    };

    // 1️⃣ Send payload to LIMS
    const limsResponse = await sendToLims(limsUrl, headers, req.body);
    console.log("✅ LIMS RESPONSE RECEIVED");

    if (!limsResponse.IsSuccess) {
      return res.status(400).json({
        success: false,
        source: "LIMS",
        error: limsResponse.Error
      });
    }

    // 2️⃣ Insert VisitDetails
    await insertVisitDetails(limsResponse);

    // 3️⃣ Final success response
    res.json({
      success: true,
      message: "LIMS success & VisitDetails saved",
      VisitId: limsResponse.Success.Data.VisitId
    });

  } catch (err) {
    console.error("❌ API ERROR:", err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* =====================================================
   START SERVER
===================================================== */
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
