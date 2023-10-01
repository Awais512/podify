import { RequestHandler } from "express";
import nodemailer from "nodemailer";
import path from "path";

import { CreateUser } from "@/@types/user";
import User from "@/models/user";
import EmailVerificationToken from "@/models/emailVerification";

import { MAILTRAP_PASS, MAILTRAP_USER } from "@/utils/variables";
import { generateToken } from "@/utils/helper";
import { generateTemplate } from "@/mail/template";

export const create: RequestHandler = async (req: CreateUser, res) => {
  const { email, password, name } = req.body;

  const user = await User.create({ name, email, password });

  const token = generateToken();
  await EmailVerificationToken.create({
    owner: user._id,
    token,
  });

  //Send verification email
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASS,
    },
  });

  transport.sendMail({
    to: user.email,
    from: "auth@myapp.com",
    subject: "Welcome Message",
    html: generateTemplate({
      title: "Welcome to Podify",
      message: `Hi ${name}, Welcome to Podify. Use the given OTPnto verify your account`,
      logo: "cid:logo",
      banner: "cid:Welcome",
      link: "#",
      btnTitle: token,
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo",
      },
      {
        filename: "welcome.png",
        path: path.join(__dirname, "../mail/welcome.png"),
        cid: "welcome",
      },
    ],
  });

  res.status(201).json({ user });
};
