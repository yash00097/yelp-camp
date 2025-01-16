import express from 'express'
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDB.js';
import Campground from './models/campground.model.js';
import methodOverride from 'method-override';
import ejsMate from 'ejs-mate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();
const app = express();
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
 
app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
    res.render("campgrounds/new");
});

app.post('/campgrounds', async (req, res) => {
    const campground = await Campground.create(req.body.campground);
    res.redirect(`/campgrounds/${campground._id}`);
});

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
});

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
});

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
    connectDB();
});  