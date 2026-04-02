const axios = require("axios");

const url ="https://lims.neubergdiagnostics.com/slimsuat.api/api/public/SaveThirdPartyRegistration";

const payload = {
    "TitleName": "Mr.",
    "Gender": "M",
    "IntegrationOrderId": "055762890",
    "BranchId": 1,
    "RegistrationServiceDetails": [
        {
            "ServiceId": 18,
            "IntegrationServiceCode": null    
        }
    ]
}

axios.post(url, payload, {
    headers: {
        "UserId":"7",
        "Password":"Agile@12345",
        "Content-Type": "application/json"
    }
})
.then((response) => {
    console.log(" Full Response:", response.data);

    if (response.data.IsSuccess === true) {
        console.log(" IsSuccess: TRUE - Request was successful");
    } else {
        console.log(" IsSuccess: FALSE - Request failed");
    }
})
.catch((error) => {
    if (error.response) {
        console.log(" API Error:", error.response.data);

        if (error.response.data.status === false) {
            console.log(" Status: FALSE - Server returned an error");
        }
    } else {
        console.log(" Network/Other Error:", error.message);
    }
});