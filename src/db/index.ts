import mongoose from "mongoose";
import { MONGO_URI } from "@/utils/variables";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("DB is Connected");
  })
  .catch((err) => console.log("[DATABASE_ERROR]", err));
