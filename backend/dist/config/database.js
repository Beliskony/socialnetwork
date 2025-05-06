import mongoose from "mongoose";
import dotenv from "dotenv";
const connectDB = async () => {
    dotenv.config();
    const DATABASE_URL = process.env.DATABASE_URL;
    const DATABASE_NAME = process.env.DATABASE_NAME;
    try {
        await mongoose.connect(DATABASE_URL, { dbName: DATABASE_NAME });
        console.log("connecter a la DB");
    }
    catch (error) {
        console.log("erreur de connection");
        process.exit(1);
    }
};
export default connectDB;
