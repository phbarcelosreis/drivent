import bookingRepository from "@/repositories/booking-repository";

async function getBooking(userId: number) {

    const booking = await bookingRepository.findBooking(userId);
    return booking;
}

const bookingService = {
    getBooking
}

export default bookingService;