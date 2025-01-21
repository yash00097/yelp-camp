import express from 'express'
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDB.js';
import Campground from './models/campground.model.js';
import methodOverride from 'method-override';
import ejsMate from 'ejs-mate';
import { catchAsync } from './utils/catchAsync.js';
import ExpressError from './utils/ExpressError.js';
import { campgroundSchema, reviewSchema } from './schemas.js';
import { Review } from './models/review.model.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();
const app = express();
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
 
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

app.post('/campgrounds',validateCampground,catchAsync( async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = await Campground.create(req.body.campground);
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/:id',catchAsync( async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render("campgrounds/show", { campground });
}));

app.get('/campgrounds/:id/edit',catchAsync( async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
}));

app.put('/campgrounds/:id',validateCampground,catchAsync( async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id',catchAsync( async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews',catchAsync( async (req, res) => {
    const {id}=req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync( async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));


app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
    connectDB();
});  