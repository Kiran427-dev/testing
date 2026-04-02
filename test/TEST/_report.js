const axios = require("axios");
const PDFDocument = require("pdfkit");
const fs = require("fs");

// ======================================================
// API URL
// ======================================================
const url ="https://lims.neubergdiagnostics.com/slimsuat.api/api/public/public/SaveThirdPartyVisitDetails";

// ======================================================
// REQUEST PAYLOAD
// ======================================================
const payload = { 
    "BranchId": 1, 
    "VisitBookedBy": "aa", 
    "IntegrationVisitOrderId": "42434329239953", 
    "CollectionDateTime": "2025-12-01 20:00:00", 
    "Address": "ahem", 
    "AreaId": "1", 
    "CityId": "32", 
    "RegistrationDate": "2025-12-01", 
    "MobileNo": "8866456127", 
    "VisitPatientDetails": [ 
        { 
            "IntegrationPatientId": "P1945246810065", 
            "BirthDate": "1992-05-19", 
            "AreaId": "1", 
            "CityId": "32", 
            "FirstName": "kumar", 
            "Gender": "M",
            "VisitServiceDetails": [ { "Serviceid": "1" } ]
        }  
    ]
};

// ======================================================
// PDF REPORT GENERATOR (REQUEST + RESPONSE)
// ======================================================
function generateReport(res, requestPayload) {
    const doc = new PDFDocument();
    const filePath = `visit_report_${Date.now()}.pdf`;

    doc.pipe(fs.createWriteStream(filePath));

    const isSuccess = res?.IsSuccess ?? "N/A";
    const message = res?.Message ?? "N/A";
    const visitOrderId = res?.Data?.VisitOrderId ?? "N/A";

    // Title
    doc.fontSize(20).text("SLIMS VisitPatient Report UAT", { underline: true });
    doc.moveDown();

    // ===========================
    // RESPONSE SUMMARY
    // ===========================
    doc.fontSize(12).text("=== Response Summary ===");
    doc.text(`Status: ${isSuccess}`);
    doc.text(`Message: ${message}`);
    doc.text(`Visit Order ID: ${visitOrderId}`);
    doc.text(`Generated At: ${new Date().toISOString()}`);
    doc.moveDown();

    // ===========================
    // REQUEST PAYLOAD
    // ===========================
    doc.fontSize(12).text("=== Request Payload ===");
    doc.text(JSON.stringify(requestPayload, null, 4));
    doc.moveDown();

    // ===========================
    // FULL RESPONSE DATA
    // ===========================
    doc.fontSize(12).text("=== Full Response Data ===");
    doc.text(JSON.stringify(res, null, 4));

    doc.end();
    return filePath;
}

// ======================================================
// SEND API REQUEST
// ======================================================
axios.post(url, payload, {
    headers: {
        "UserId": "7",
        "Password": "Agile@12345",
        "Content-Type": "application/json"
    }
})
.then((response) => {
    console.log("Full Response:", response.data);

    const reportFile = generateReport(response.data, payload);

    if (response.data.IsSuccess === true) {
        console.log("IsSuccess: TRUE - Request successful.");
    } else {
        console.log("IsSuccess: FALSE - Request failed.");
    }

    console.log("PDF Report Generated:", reportFile);
})
.catch((error) => {
    if (error.response) {
        console.log("API Error:", error.response.data);

        const reportFile = generateReport(error.response.data, payload);
        console.log("Error Report Generated:", reportFile);

    } else {
        console.log("Network/Other Error:", error.message);

        const reportFile = generateReport({ Message: error.message }, payload);
        console.log("Network Error Report Generated:", reportFile);
    }
});
