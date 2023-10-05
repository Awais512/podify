import {
  create,
  generateForwardPasswordLink,
  grantValid,
  sendReVerificationToken,
  verifyEmail,
} from "@/controllers/user";
import { isValidPasswordResetToken } from "@/middlewares/auth";
import { validate } from "@/middlewares/validator";
import {
  CreateUserSchema,
  TokenAndIDValidation,
} from "@/utils/validationSchema";
import express from "express";

const router = express.Router();

router.post("/create", validate(CreateUserSchema), create);
router.post("/verify-email", validate(TokenAndIDValidation), verifyEmail);
router.post("/re-verify-email", sendReVerificationToken);
router.post("/forget-password", generateForwardPasswordLink);
router.post(
  "/verify-pass-reset-token",
  validate(TokenAndIDValidation),
  isValidPasswordResetToken,
  grantValid
);

export default router;
