const fs = require("fs");

app.post("/webhook", (req, res) => {
    fs.writeFileSync("payload.json", JSON.stringify(req.body, null, 2));
    res.status(200).send("Saved");
});
