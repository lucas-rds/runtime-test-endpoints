const express = require("express");
const app = express();
const fs = require("fs");
const Mustache = require("mustache");
const multer = require("multer");

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + ".json";
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({
  storage,
  fileFilter: (_, file, next) => {
    if (
      file.mimetype === "application/json" &&
      file.originalname.includes(".json")
    ) {
      return next(null, true);
    }
    next(null, false);
  },
});

const routes = [{ url: "/", json: "" }]; // [{ url:"/path", json: "name.json"}]
app.get("/", (req, res) => {
  res.setHeader("Content-type", "text/html");
  const template = fs.readFileSync("./index.html", "utf-8");
  res.send(
    Mustache.render(template, {
      routes,
    })
  );
});

app.post("/add", upload.single("json"), (req, res) => {
  console.log(req.file);
  console.log(req.body);

  if (req.file && req.body && req.body.path) {
    routes.push({
      url: req.body.path,
      json: req.file.originalname,
      buffer: req.file.buffer,
    });

    app.get(`/${req.body.path}`, (_, response) => {
      //   ** for multer.diskStorage:
      //   const path = "" + req.file.path;
      //   const json = fs.readFileSync(`./${path}`, "utf-8");
      
      //   ** for multer.memoryStorage:
      const buff = routes.find((route) => route.url === req.body.path).buffer;
      response.json(JSON.parse(buff.toString()));
    });

    return res.send("added");
  }

  res.status(400);
  res.send("Erro");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});
