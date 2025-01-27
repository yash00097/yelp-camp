import express from 'express'
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDB.js';
import methodOverride from 'method-override';
import ejsMate from 'ejs-mate';
import ExpressError from './utils/ExpressError.js';
import campgroundRoutes from './routes/campgrounds.route.js';
import reviewRoutes from './routes/reviews.route.js';
import userRoutes from './routes/users.route.js';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import {User} from './models/user.model.js';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const sessionConfig = {
    secret: 'thisshouldbeabdsfsecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// Configure Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID, // Add your Google Client ID
            clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Add your Google Client Secret
            callbackURL: 'http://localhost:3000/auth/google/callback', // Change if your app runs on a different domain/port
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists in the database
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    // If the user doesn't exist, create a new user
                    user = new User({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        username: profile.displayName,
                    });
                    await user.save();
                }

                return done(null, user); // Pass the user to serializeUser
            } catch (err) {
                return done(err, null);
            }
        }
    )
);


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);
 
app.get("/", (req, res) => {
    res.send("Hello World!");
});



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