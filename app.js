import express from 'express'
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDB.js';
import Campground from './models/campground.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.get("/campgrounds", async (req, res) => {
    const camp= new Campground({
        title: "My Backyard",
        description: "Good place to go for a picnic"})
    await camp.save();
    res.send(camp);

})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
    connectDB();
});