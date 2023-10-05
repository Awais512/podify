import {
  create,
  sendReVerificationToken,
  verifyEmail,
} from "@/controllers/user";
import { validate } from "@/middlewares/validator";
import {
  CreateUserSchema,
  EmailVerificationBody,
} from "@/utils/validationSchema";
import express from "express";

const router = express.Router();

router.post("/create", validate(CreateUserSchema), create);
router.post("/verify-email", validate(EmailVerificationBody), verifyEmail);
router.post("/re-verify-email", sendReVerificationToken);

export default router;
