import { AuthenticatedRequest } from "@/middlewares";
import { CreateBookingParams } from "@/protocols";
import bookingService from "@/services/booking-service";
import { Response } from "express";
import httpStatus from "http-status";

async function getBooking(req: AuthenticatedRequest, res: Response) {

  const { userId } = req;

  try {

    const booking = await bookingService.getBooking(Number(userId));

    return res.status(httpStatus.OK).send(booking);

  } catch (error) {

    return res.sendStatus(httpStatus.NOT_FOUND);

  }

}

async function postBooking(req: AuthenticatedRequest, res: Response) {

  const { userId } = req;
  const { roomId } = req.body as CreateBookingParams;

  console.log(userId)

  try {

    const createdBooking = await bookingService.bookingPost({ userId, roomId });

    return res.status(httpStatus.OK).send(createdBooking);

  } catch (error) {

    console.log(error)

    if (error.name === "NotFoundError") {

      return res.sendStatus(httpStatus.NOT_FOUND);

    }

    return res.sendStatus(httpStatus.FORBIDDEN);

  }
}

async function putBooking(req: AuthenticatedRequest, res: Response) {



}

export {
  getBooking,
  postBooking,
  putBooking
}