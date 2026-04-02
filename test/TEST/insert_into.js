const sql = require("mssql");

// ================= DB CONFIG =================
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

// ================= DB CONNECT =================
async function checkDbConnection() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("✅ SQL Server connected");
    return pool;
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    return null;
  }
}

// ================= MAIN =================
async function main() {
  const pool = await checkDbConnection();
  if (!pool) return;

  try {
    console.log("🚀 Starting insert...");
    await insertAndVerify(pool, payload);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.close();
  }
}

//const pool = await checkDbConnection();
//payload------------------------
// ============================================
//INSERT INTO DB
// ============================================
async function insertAndVerify(payload) {

  if (!payload) {
    console.error("❌ Payload is missing");
    return;
  }

  const pool = await checkDbConnection();
  if (!pool) return;

  try {
    const RegistrationDate = payload.RegistrationDate
      ? new Date(payload.RegistrationDate)
      : new Date();

    const CollectionDateTime = payload.CollectionDateTime
      ? new Date(payload.CollectionDateTime)
      : new Date();

    const VisitBookedBy = payload.VisitBookedBy
    console.log("VisitBookedBy:", VisitBookedBy);

    const insertQuery = `
      INSERT INTO VisitDetails (
        RegistrationDate,
        CollectionDateTime,
        VisitBookedBy,
        Address,
        CityId,
        AreaId,
        MobileNo,
        BranchId,
        CreatedBy,
        CreatedFrom
      )
      VALUES (
        @RegistrationDate,
        @CollectionDateTime,
        @VisitBookedBy,
        @Address,
        @CityId,
        @AreaId,
        @MobileNo,
        @BranchId,
        @CreatedBy,
        @CreatedFrom
      );
    `;

    await pool.request()
      .input("RegistrationDate", sql.DateTime, RegistrationDate)
      .input("CollectionDateTime", sql.DateTime, CollectionDateTime)
      .input("VisitBookedBy", sql.VarChar(50), VisitBookedBy)
      .input("Address", sql.VarChar(200), payload.Address)
      .input("CityId", sql.Int, payload.CityId)
      .input("AreaId", sql.Int, payload.AreaId)
      .input("MobileNo", sql.VarChar(15), payload.MobileNo)
      .input("BranchId", sql.Int, payload.BranchId)
      .input("CreatedBy", sql.VarChar(20), "AUTO")
      .input("CreatedFrom", sql.VarChar(20), "Admin")
      .query(insertQuery);

    console.log("VisitDetails inserted successfully");

  } catch (err) {
    console.error("VisitDetails insert error:", err.message);
  } finally {
    await pool.close();
  }
}
main()