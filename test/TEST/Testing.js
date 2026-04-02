const axios = require("axios");

async function sendVisitPayload() {
  try {
    // 👉 Add your endpoint here
    const url = " https://lims.neubergdiagnostics.com/slimsuat.api/api/public/public/SaveThirdPartyVisitDetails";

    // 👉 Headers with UserId & Password
    const headers = {
      "Content-Type": "application/json",
      "UserId": "7",
      "Password": "Agile@12345"
    };

    const payload = {
      BranchId: 1,
      VisitBookedBy: "MA",
      IntegrationVisitOrderId: "62023209",
      // IntegrationBranchCode: "000111",
      CollectionDateTime: "2025-12-15 12:00:00",
      Address: "ahem",
      AreaId: "1",
      CityId: "32",
      RegistrationDate: "2025-12-15",
      MobileNo: "8866456124",
      VisitPatientDetails: [
        {
          IntegrationPatientId: "P6292865",
          BirthDate: "1992-05-19",
          AreaId: "1",
          CityId: "32",
          FirstName: "Dharmesh1",
          Gender: "M",
          VisitServiceDetails: [
            {
              Serviceid: "1"
            }
          ]
        }
      ]
    };

    const response = await axios.post(url, payload, { headers });

    console.log("✅ API Response:");
    console.log(response.data);

  } catch (error) {
    console.error("❌ API Error");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    } else {
      console.error(error.message);
    }
  }
}



const { sql, dbConfig } = require("./dbConfig");

let pool;

async function getDbConnection() {
  try {
    if (pool) return pool;

    pool = await sql.connect(dbConfig);
    console.log("✅ SQL Server connected");
    return pool;

  } catch (err) {
    console.error("❌ DB Connection failed:", err);
    throw err;
  }
}

module.exports = { getDbConnection };


const { getDbConnection } = require("./dbConnection");

async function logApiCall(data) {
  const pool = await getDbConnection();

  const {
    apiName,
    endpoint,
    method,
    requestHeaders,
    requestPayload,
    responseStatusCode,
    responseBody,
    isSuccess,
    errorMessage
  } = data;

  await pool.request()
    .input("ApiName", apiName)
    .input("Endpoint", endpoint)
    .input("HttpMethod", method)
    .input("RequestHeaders", JSON.stringify(requestHeaders))
    .input("RequestPayload", JSON.stringify(requestPayload))
    .input("ResponseStatusCode", responseStatusCode)
    .input("ResponseBody", JSON.stringify(responseBody))
    .input("IsSuccess", isSuccess)
    .input("ErrorMessage", errorMessage)
    .query(`
      INSERT INTO ApiRequestResponseLog (
        ApiName,
        Endpoint,
        HttpMethod,
        RequestHeaders,
        RequestPayload,
        ResponseStatusCode,
        ResponseBody,
        IsSuccess,
        ErrorMessage
      )
      VALUES (
        @ApiName,
        @Endpoint,
        @HttpMethod,
        @RequestHeaders,
        @RequestPayload,
        @ResponseStatusCode,
        @ResponseBody,
        @IsSuccess,
        @ErrorMessage
      )
    `);
}

// Call function
sendVisitPayload();
