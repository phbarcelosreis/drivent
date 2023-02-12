import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import { Hotel, Room } from "@prisma/client";

async function getBooking(userId: number): Promise<GetBookingExpected> {

    const booking = await bookingRepository.findBooking(userId);

    if (!booking) throw notFoundError();

    const bookingInfo = {
        bookingId: booking.id,
        hotel: booking.Room.Hotel,
        room: {
            id: booking.Room.id,
            name: booking.Room.name,
            capacity: booking.Room.capacity,
            hotelId: booking.Room.hotelId,
            booked: booking.Room._count.Booking,
        }
    }

    return bookingInfo;
}

type GetBookingExpected = {
    bookingId: number;
    hotel: Omit<Hotel, "createdAt" | "updatedAt">;
    room: Omit<Room, "createdAt" | "updatedAt"> 
    & { booked: number };
}

const bookingService = {
    getBooking
}

export default bookingService;