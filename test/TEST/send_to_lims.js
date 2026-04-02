import axios from "axios";
const axios = require("axios");

async function sendToLims(url, headers, payload) {
  try {
    console.log("➡️ Sending payload to LIMS");

    const response = await axios.post(url, payload, { headers });

    console.log("✅ LIMS Response:", response.data);

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error("❌ LIMS Error");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);

      return {
        success: false,
        status: error.response.status,
        data: error.response.data
      };
    }

    return {
      success: false,
      message: error.message
    };
  }
}

const limsUrl =
      "https://lims.neubergdiagnostics.com/slimsuat.api/api/public/public/SaveThirdPartyVisitDetails";

const headers = {
        "userid": 7,
        "password": "Agile@12345",
      "Content-Type": "application/json"
    };

const payload = { 

    "BranchId": 1, 
    "VisitBookedBy": "MA",
    "IntegrationVisitOrderId": "62023209", 
    "CollectionDateTime": "2025-12-15 12:00:00", 
    "Address": "ahem", 
    "AreaId": "1", 
    "CityId": "32", 
    "RegistrationDate": "2025-12-15", 
    "MobileNo": "8866456124", 
    "VisitPatientDetails": [ 
        { 
            "IntegrationPatientId": "P6292865", 
            "BirthDate": "1992-05-19", 
            "AreaId": "1", 
            "CityId": "32", 
            "FirstName": "Dharmesh1", 
            "Gender": "M", 
            
            "VisitServiceDetails": [ 
                {  
                    "Serviceid": "1" 
                } 
            ]
        }  
    ]
} 

const limsResponse = await sendToLims(limsUrl, headers, payload);
// console.log("✅ LIMS Response:", limsResponse);

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

    console.log("✅ VisitDetails inserted successfully");

  } catch (err) {
    console.error("❌ VisitDetails insert error:", err.message);
  } finally {
    await pool.close();
  }
}
main()