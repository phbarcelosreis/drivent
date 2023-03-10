import { enrollmentNotFound, notFoundError } from "@/errors";
import { cannotBookingError } from "@/errors/cannot-book-error";
import { ticketNotFound } from "@/errors/cannot-found-ticket";
import { CreateBookingParams } from "@/protocols";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { Hotel, Room, TicketStatus } from "@prisma/client";
import httpStatus from "http-status";

type GetBookingExpected = {
    bookingId: number;
    hotel: Omit<Hotel, "createdAt" | "updatedAt">;
    room: Omit<Room, "createdAt" | "updatedAt"> & { booked: number };
}

async function getBooking(userId: number): Promise<GetBookingExpected> {

    const booking = await bookingRepository.findBookingByUserId(userId);

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

type PostBookingResult = {
    bookingId: number
};

async function bookingPost({ userId, roomId }: CreateBookingParams): Promise<PostBookingResult> {
    await validateUserBookingEligibility(userId);

    const findBooking = await bookingRepository.findBookingByUserId(userId);

    console.log(findBooking)

    if (!findBooking) throw notFoundError();

    await roomAvailable(roomId)

    const booking = await bookingRepository.createBooking({
        roomId,
        userId,
    });

    return {
        bookingId: booking.id
    };
}

async function roomAvailable(roomId: number) {

    const room = await hotelRepository.findRoomById(roomId);

    if (!room) throw notFoundError();

    const roomUsers = await bookingRepository.findUsersRoom(roomId);

    console.log(room);
    console.log(roomUsers)

    if (room.capacity === roomUsers.length) throw (httpStatus.FORBIDDEN);

}

async function validateUserBookingEligibility(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

    if (!enrollment) throw enrollmentNotFound();

    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

    if (

        !ticket ||
        !ticket.TicketType.includesHotel ||
        ticket.TicketType.isRemote ||
        ticket.status !== TicketStatus.PAID

    ) {

        throw ticketNotFound();

    }
}

export type UpdateBooking = CreateBookingParams & { bookingId: number };

async function putBooking({ userId, roomId, bookingId }: UpdateBooking) {

    const booking = await bookingRepository.findBookingById(bookingId);

    if (!booking) {

        throw notFoundError();

    }

    const bookingUser = await bookingRepository.findBookingByUserId(userId);

    if (!bookingUser || bookingId !== booking.id) throw ticketNotFound();

    const room = await hotelRepository.findRoomById(roomId);

    if (!room) throw notFoundError()

    const newBooking = await bookingRepository.updateBooking({
        id: bookingId,
        roomId
    });

    return { bookingId: newBooking.id };

}

const bookingService = {
    getBooking,
    bookingPost,
    putBooking
}

export default bookingService;