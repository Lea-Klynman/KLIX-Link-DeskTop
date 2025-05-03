const express = require("express");
const open = require("open");
const path = require("path");

const app = express();
app.use(express.static("public"));

app.get("/open-doc", (req, res) => {
    const filePath = path.join(__dirname, "example.docx");
    open(`mysecureapp://${filePath}`);
    res.send("Opening secure document viewer...");
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
