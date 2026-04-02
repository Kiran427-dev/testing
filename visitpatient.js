const axios = require("axios");

const url = "https://lims.neubergdiagnostics.com/slimsuat.api/api/public/public/SaveThirdPartyVisitDetails";

const payload =  { 
    "BranchId": 1, 
    "VisitBookedBy": "kiran102", 
    "IntegrationVisitOrderId": "9262379270983", 
    //"IntegrationBranchCode": "000111",
    "CollectionDateTime": "2025-12-11 20:00:00", 
    "Address": "ahem", 
    "AreaId": "1", 
    "CityId": "32", 
    "RegistrationDate": "2025-12-11", 
    "MobileNo": "8866456120", 
    "VisitPatientDetails": [ 
        { 
            "IntegrationPatientId": "P9927095810035", 
            "BirthDate": "1992-05-19", 
            "AreaId": "1", 
            "CityId": "32", 
            "TitleId":"4",
            "FirstName": "rajesh", 
            "Gender": "M", 
            
            "VisitServiceDetails": [ 
                {  
                    "Serviceid": "1" 
                } 
            ],

            "IntegrationPatientId": "P9927095810035", 
            "BirthDate": "1995-07-23", 
            "AreaId": "2", 
            "CityId": "32", 
            "TitleId":"4",
            "FirstName": "suresh", 
            "Gender": "M", 
            
            "VisitServiceDetails": [ 
                {  
                    "Serviceid": "2" 
                } 
            ]
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