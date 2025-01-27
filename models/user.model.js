import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String, // Add this field to store the Google OAuth user ID
        unique: true, // Ensure uniqueness for Google users
        sparse: true  // Sparse index because not all users will have a Google ID
    }
});

userSchema.plugin(passportLocalMongoose);

export const User = mongoose.model("User", userSchema);
