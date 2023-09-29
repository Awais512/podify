import User from "@/models/user";
import express from "express";

const router = express.Router();

router.post("/create", async (req, res) => {
  const { email, password, name } = req.body;

  const user = await User.create({ name, email, password });
  res.json({ user });
});

export default router;
