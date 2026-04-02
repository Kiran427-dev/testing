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
   DB CONNECTION
===================================================== */
async function getDbPool() {
  if (pool) return pool;
  pool = await sql.connect(dbConfig);
  console.log("SQL Server connected");
  return pool;
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
   INSERT INTO SAMPLE TABLE (SAFE)fgh
===================================================== */
async function insertSample(limsResponse) {
  const pool = await getDbPool();
  const header = limsResponse?.Success?.Data;
  if (!header) throw new Error("Invalid LIMS response");

  /* ================= SERVICE (FIRST ONLY) ================= */
const services = header.RegistrationServiceDetails || [];

for (const service of services) {

  await pool.request()

    /* ================= HEADER ================= */
    .input("LabId", sql.NVarChar(50), header.LabId)
    .input("RegistrationDate", sql.DateTimeOffset, header.RegistrationDate)
    .input("IsB2B", sql.Bit, header.IsB2B ? 1 : 0)
    .input("BranchName", sql.NVarChar(100), header.BranchName)
    .input("IntegrationBranchCode", sql.NVarChar(50), header.IntegrationBranchCode || null)
    .input("B2BName", sql.NVarChar(100), header.B2BName || null)
    .input("IntegrationB2BCode", sql.NVarChar(50), header.IntegrationB2BCode || null)
    .input("Title", sql.NVarChar(10), header.Title)
    .input("FirstName", sql.NVarChar(100), header.FirstName)
    .input("MiddleName", sql.NVarChar(100), header.MiddleName)
    .input("LastName", sql.NVarChar(100), header.LastName)
    .input("Gender", sql.NVarChar(10), header.Gender)
    .input("StrGender", sql.NVarChar(20), header.StrGender || null)
    .input("BirthDate", sql.DateTime, header.BirthDate ? new Date(header.BirthDate) : null)
    .input("IntegrationOrderId", sql.NVarChar(100), header.IntegrationOrderId)
    .input("RefId1", sql.NVarChar(50), header.RefId1)
    .input("RefId2", sql.NVarChar(50), header.RefId2 || null)
    .input("Mobile", sql.NVarChar(20), header.Mobile)
    .input("Phone", sql.NVarChar(20), header.Phone || null)
    .input("EmailId", sql.NVarChar(100), header.EmailId)
    .input("Address", sql.NVarChar(500), header.Address)
    .input("Remarks", sql.NVarChar(500), header.Remarks || null)
    .input("AadharNo", sql.NVarChar(20), header.AadharNo || null)
    .input("ExpectedReportDateTime", sql.DateTime, header.ExpectedReportDateTime ? new Date(header.ExpectedReportDateTime) : null)
    .input("TestingStatus", sql.NVarChar(50), header.TestingStatus)
    .input("RefNo", sql.NVarChar(50), header.RefNo || null)
    .input("IsVIP", sql.Bit, header.IsVIP ? 1 : 0)
    .input("NationalityId", sql.Int, header.NationalityId || null)
    .input("IsUrgentServiceAvailable", sql.Bit, header.IsUrgentServiceAvailable ? 1 : 0)
    .input("IntegrationSoftwareId", sql.Int, header.IntegrationSoftwareId || null)
    .input("ApprovedDate", sql.DateTime, header.ApprovedDate ? new Date(header.ApprovedDate) : null)
    .input("PatientName", sql.NVarChar(200), header.PatientName)
    .input("AgeString", sql.NVarChar(50), header.AgeString)
    .input("NationalityName", sql.NVarChar(100), header.NationalityName || null)
    .input("B2BCode", sql.NVarChar(50), header.B2BCode || null)
    .input("IntegrationPatientId", sql.NVarChar(50), header.IntegrationPatientId || null)
    .input("BranchId", sql.Int, header.BranchId)
    .input("ReceiptURL", sql.NVarChar(500), header.ReceiptURL)
    .input("ReportFileURL", sql.NVarChar(500), header.ReportFileURL)
    .input("PatientId", sql.Int, header.PatientId)
    .input("MembershipId", sql.Int, header.MembershipId || null)
    .input("TotalAmount", sql.Decimal(18,2), header.TotalAmount)
    .input("NetAmount", sql.Decimal(18,2), header.NetAmount)
    .input("DiscountAmount", sql.Decimal(18,2), header.DiscountAmount)
    .input("PrivilegeCardCode", sql.NVarChar(50), header.PrivilegeCardCode || null)

    /* ================= SERVICE ================= */
    .input("ServiceId", sql.NVarChar(50), String(service.ServiceId))
    .input("ServiceName", sql.NVarChar(200), service.ServiceName)
    .input("IntegrationServiceCode", sql.NVarChar(100), service.IntegrationServiceCode || null)
    .input("Status", sql.NVarChar(50), service.Status || null)
    .input("RSDTotalAmount", sql.Decimal(18,2), service.TotalAmount || 0)
    .input("RSDNetAmount", sql.Decimal(18,2), service.NetAmount || 0)
    .input("RSDDiscountAmount", sql.Decimal(18,2), service.DiscountAmount || 0)

    .query(`
      INSERT INTO sample_new (
        LabId, RegistrationDate, IsB2B, BranchName,
        IntegrationBranchCode, B2BName, IntegrationB2BCode,
        Title, FirstName, MiddleName, LastName, Gender, StrGender,
        BirthDate, IntegrationOrderId, RefId1, RefId2, Mobile,
        Phone, EmailId, Address, Remarks, AadharNo,
        ExpectedReportDateTime, TestingStatus, RefNo, IsVIP,
        NationalityId, IsUrgentServiceAvailable, IntegrationSoftwareId,
        ApprovedDate, PatientName, AgeString, NationalityName,
        B2BCode, IntegrationPatientId, BranchId, ReceiptURL,
        ReportFileURL, PatientId, MembershipId, TotalAmount,
        NetAmount, DiscountAmount, PrivilegeCardCode,
        ServiceId, ServiceName, IntegrationServiceCode, Status,
        RSDTotalAmount, RSDNetAmount, RSDDiscountAmount
      )
      VALUES (
        @LabId, @RegistrationDate, @IsB2B, @BranchName,
        @IntegrationBranchCode, @B2BName, @IntegrationB2BCode,
        @Title, @FirstName, @MiddleName, @LastName, @Gender, @StrGender,
        @BirthDate, @IntegrationOrderId, @RefId1, @RefId2, @Mobile,
        @Phone, @EmailId, @Address, @Remarks, @AadharNo,
        @ExpectedReportDateTime, @TestingStatus, @RefNo, @IsVIP,
        @NationalityId, @IsUrgentServiceAvailable, @IntegrationSoftwareId,
        @ApprovedDate, @PatientName, @AgeString, @NationalityName,
        @B2BCode, @IntegrationPatientId, @BranchId, @ReceiptURL,
        @ReportFileURL, @PatientId, @MembershipId, @TotalAmount,
        @NetAmount, @DiscountAmount, @PrivilegeCardCode,
        @ServiceId, @ServiceName, @IntegrationServiceCode, @Status,
        @RSDTotalAmount, @RSDNetAmount, @RSDDiscountAmount
      )
    `);
}
  console.log("✅ sample table insert completed");
}

/* =====================================================
   API ENDPOINT
===================================================== */
app.post("/SaveThirdPartyRegistration", async (req, res) => {
  try {
    const limsUrl =
      "https://lims.neubergdiagnostics.com/slimsuat.api/api/public/public/SaveThirdPartyRegistration";

    const headers = {
      userid: 7,
      password: "Agile@12345",
      "Content-Type": "application/json"
    };

    const limsResponse = await sendToLims(limsUrl, headers, req.body);

    if (!limsResponse.IsSuccess) {
      return res.status(400).json({
        success: false,
        error: limsResponse.Error
      });
    }

    await insertSample(limsResponse);
    res.json({
      success: true,
      message: "Registration saved successfully"
    });
    
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});
/* =====================================================
   START SERVER
===================================================== */
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});