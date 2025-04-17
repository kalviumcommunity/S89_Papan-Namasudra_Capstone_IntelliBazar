const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 8080;

app.get("/", (request, response) => {
    try {
        response.status(200).send({ msg: "This is my backend" });
    } catch (error) {
        response.status(500).send({ message: "error occurred" });
    }
});

app.listen(PORT, async () => {
    try {
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.log("Server not connected", error);
    }
});