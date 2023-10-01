import { create, verifyEmail } from "@/controllers/user";
import { validate } from "@/middlewares/validator";
import { CreateUserSchema } from "@/utils/validationSchema";
import express from "express";

const router = express.Router();

router.post("/create", validate(CreateUserSchema), create);
router.post("/verify-email", verifyEmail);

export default router;
