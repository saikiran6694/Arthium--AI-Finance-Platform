import mongoose from "mongoose";
import { Env } from "./env.config";

export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(Env.MONGO_URI, {
      serverSelectionTimeoutMS: 8080,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 100000,
    });
    console.log(`Connected to MongoDB successfully: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to MongoDB database: ", error);
    process.exit(1);
  }
};

export default connectDatabase;
