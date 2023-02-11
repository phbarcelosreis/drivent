import { getBooking } from "@/controllers";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter
  .get("", getBooking)

export { bookingRouter };
