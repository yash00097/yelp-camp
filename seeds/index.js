import { connectDB } from "../db/connectDB.js";
import mongoose from "mongoose";
import Campground from "../models/campground.model.js";
import {cities} from "./cities.js";
import {places, descriptors} from "./seedHelpers.js";

const sample = (array) => array[Math.floor(Math.random()*array.length)];

const seedDB = async () => {
    await connectDB();
    await Campground.deleteMany({});
    for (let i=0; i<50; i++){
        const rand1000 = Math.floor(Math.random()*1000);
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})