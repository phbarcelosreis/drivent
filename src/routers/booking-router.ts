import { getBooking, postBooking } from "@/controllers";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("", getBooking)
  .post("", postBooking)

export { bookingRouter };
