var express = require("express");
var app = express();
var fs = require('fs');

app.get("/", (req, res, next) => {
    const json = fs.readFileSync("./json.json", "utf-8");
    res.send(json);
});

app.listen(process.env.PORT || 3000, () => {
 console.log("Server running on port 3000");
});