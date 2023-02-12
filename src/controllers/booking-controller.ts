import { AuthenticatedRequest } from "@/middlewares";
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
    const { roomId } = req.body;

    try {
        /* const createdBooking = await bookingService.postBooking({ userId, roomId }); */
    
        return res.status(httpStatus.OK).send();

      } catch (error) {
        if (error.name === "NotFoundError") {
          return res.sendStatus(httpStatus.NOT_FOUND);
        }
    
        return res.sendStatus(httpStatus.FORBIDDEN);
      }

}

export {
    getBooking,
    postBooking
}