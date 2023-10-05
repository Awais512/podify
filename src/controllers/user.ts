import { RequestHandler } from "express";
import Crypto from "crypto";

import { CreateUser, VerifyEmailRequest } from "@/@types/user";
import User from "@/models/user";

import { generateToken } from "@/utils/helper";
import {
  sendForgotPasswordLink,
  sendPassResetSuccessEmail,
  sendVerificationMail,
} from "@/utils/mail";
import EmailVerification from "@/models/emailVerification";
import { isValidObjectId } from "mongoose";
import PasswordResetToken from "@/models/passwordResetToken";
import { PASSWORD_RESET_LINK } from "@/utils/variables";

//@desc      Create New User
//@Route     POST /auth/create
//@access    Public
export const create: RequestHandler = async (req: CreateUser, res) => {
  const { email, password, name } = req.body;

  const user = await User.create({ name, email, password });

  // send verification email
  const token = generateToken();
  await EmailVerification.create({
    owner: user._id,
    token,
  });
  sendVerificationMail(token, { name, email, userId: user._id.toString() });

  res.status(201).json({ user });
};

// Verify Email Address

//@desc      Verify Email Address
//@Route     POST /auth/verify-email
//@access    Public
export const verifyEmail: RequestHandler = async (
  req: VerifyEmailRequest,
  res
) => {
  const { token, userId } = req.body;
  const verificationToken = await EmailVerification.findOne({
    owner: userId,
  });

  if (!verificationToken)
    return res.status(403).json({ error: "Invalid token!" });

  // Match Token in Database
  const matched = await verificationToken.compareToken(token);

  if (!matched) return res.status(403).json({ error: "Token not matched!" });

  await User.findByIdAndUpdate(userId, { verified: true });
  await EmailVerification.findByIdAndDelete(verificationToken._id);

  res.json({ message: "Your email is verified!" });
};

//@desc      Send Verification Tokens
//@Route     POST /auth/re-verify-email
//@access    Public
export const sendReVerificationToken: RequestHandler = async (req, res) => {
  const { userId } = req.body;

  if (!isValidObjectId(userId))
    return res.status(403).json({ error: "Invalid request!" });

  const user = await User.findById(userId);
  if (!user) return res.status(403).json({ error: "Invalid request!" });

  await EmailVerification.findOneAndDelete({
    owner: userId,
  });

  const token = generateToken();

  await EmailVerification.create({
    owner: userId,
    token,
  });

  sendVerificationMail(token, {
    name: user?.name,
    email: user?.email,
    userId: user?._id.toString(),
  });

  res.json({ message: "Please check you mail." });
};

//@desc      Generat Forgot Password Link
//@Route     POST /auth/forget-password
//@access    Public
export const generateForwardPasswordLink: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ error: "Account not found!" });

  await PasswordResetToken.findOneAndDelete({ owner: user._id });

  const token = Crypto.randomBytes(36).toString("hex");

  //Generate the Link
  await PasswordResetToken.create({ owner: user._id, token });

  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  sendForgotPasswordLink({ email: user.email, link: resetLink });

  res.json({ message: "Check your email" });
};

//@desc      Verify Password Reset Token
//@Route     POST /auth/verify-pass-reset-token
//@access    Private
export const isValidPasswordResetToken: RequestHandler = async (req, res) => {
  const { token, userId } = req.body;
  const resetToken = await PasswordResetToken.findOne({ owner: userId });
  if (!resetToken)
    return res
      .status(403)
      .json({ error: "Unauthorized access, Invalid token" });

  const matched = await resetToken.compareToken(token);

  if (!matched)
    return res
      .status(403)
      .json({ error: "Unauthorized access, Invalid token" });

  res.json({ message: "Your token is valid." });
};

//@desc      Verify Password Reset Token
//@Route     POST /auth/verify-pass-reset-token
//@access    Private
export const grantValid: RequestHandler = async (req, res) => {
  res.json({ valid: true });
};

//@desc      Update Password
//@Route     POST /auth/update-password
//@access    Private
export const updatePassword: RequestHandler = async (req, res) => {
  const { password, userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(403).json({ error: "Unauthorized access!" });

  const matched = await user.comparePassword(password);
  if (matched)
    return res
      .status(422)
      .json({ error: "The new password must be different!" });

  user.password = password;
  await user.save();

  await PasswordResetToken.findOneAndDelete({ owner: user._id });
  // send the success email

  sendPassResetSuccessEmail(user.name, user.email);
  res.json({ message: "Password resets successfully." });
};
