import { CreateUser } from "@/@types/user";
import { validate } from "@/middlewares/validator";
import User from "@/models/user";
import { CreateUserSchema } from "@/utils/validationSchema";
import express from "express";

const router = express.Router();

router.post(
  "/create",
  validate(CreateUserSchema),
  async (req: CreateUser, res) => {
    const { email, password, name } = req.body;
    CreateUserSchema.validate({ email, password, name }).catch((error) => {});

    const user = await User.create({ name, email, password });
    res.json({ user });
  }
);

export default router;
