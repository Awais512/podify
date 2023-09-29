import express from "express";
import "dotenv/config";
import "./db";
import authRouter from "@/routes/auth";

const app = express();

//Registering the middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Port is listening on port " + PORT);
});
