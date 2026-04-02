const sql = require("mssql");

const dbConfig = {
  user: "kiran",
  password: "Neuberg@123",
  server: "10.100.6.60",
  port: 1433,
  database: "ApiIntegrationDB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
    pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

module.exports = { sql, dbConfig };
