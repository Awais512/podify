import * as yup from "yup";
import { RequestHandler } from "express";
import { CreateUserSchema } from "@/utils/validationSchema";

export const validate = (schema: any): RequestHandler => {
  return async (req, res, next) => {
    if (!req.body) return res.json({ error: "Empty body is not accepted" });

    const schemaToValidate = yup.object({
      body: schema,
    });

    try {
      await schemaToValidate.validate({ body: req.body }, { abortEarly: true });
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        res.json({ error: error.message });
      }
    }
  };
};