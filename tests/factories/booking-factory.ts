import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { createHotelWithRooms } from "./hotels-factory";
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
