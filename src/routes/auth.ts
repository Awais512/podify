import { create, verifyEmail } from "@/controllers/user";
import { validate } from "@/middlewares/validator";
import {
  CreateUserSchema,
  EmailVerificationBody,
} from "@/utils/validationSchema";
import express from "express";

const router = express.Router();

router.post("/create", validate(CreateUserSchema), create);
router.post("/verify-email", validate(EmailVerificationBody), verifyEmail);
router.post("/re-verify-email", validate(EmailVerificationBody), verifyEmail);

export default router;
