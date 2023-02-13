import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus, User } from "@prisma/client";
import { createEnrollmentWithAddress } from "./enrollments-factory";
import { createHotelWithRooms } from "./hotels-factory";
import { createTicket } from "./tickets-factory";
import { createUser } from "./users-factory";

export function createBooking(roomId: number, userId: number) {
    return prisma.booking.create({
        data: {
            roomId,
            userId,
        },
    });
}

export async function createTicketTypeHotel(includesHotel = true) {
    return prisma.ticketType.create({
        data: {
            name: faker.name.findName(),
            price: faker.datatype.number(),
            isRemote: false,
            includesHotel,
        },
    });
};

export async function generateValidTicket(user?: User) {

    const newUser = user || (await createUser());
    const enrollment = await createEnrollmentWithAddress(newUser);
    const ticketType = await createTicketTypeHotel();

    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
}
