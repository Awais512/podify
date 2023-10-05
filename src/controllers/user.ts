import { RequestHandler } from "express";

import { CreateUser, VerifyEmailRequest } from "@/@types/user";
import User from "@/models/user";

import { generateToken } from "@/utils/helper";
import { sendVerificationMail } from "@/utils/mail";
import EmailVerification from "@/models/emailVerification";
import { isValidObjectId } from "mongoose";

//Create New User
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

export const generateForwardPasswordLink: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ error: "Account not found!" });

  //Generate the Link
};
