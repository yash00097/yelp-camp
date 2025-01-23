import express from 'express';
import { Review } from '../models/review.model.js';
import  Campground  from '../models/campground.model.js';
import ExpressError from '../utils/ExpressError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { reviewSchema } from '../schemas.js';



const router = express.Router({ mergeParams: true });

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


router.post('/',validateReview,catchAsync( async (req, res) => {
    const {id}=req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${id}`);
}));

router.delete('/:reviewId',catchAsync( async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

export default router;