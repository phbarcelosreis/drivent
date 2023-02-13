import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function findBookingByUserId(userId: number) {
    return prisma.booking.findFirst({
        where: { userId },
        include: {
            Room: {
                include: {
                    Hotel: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    _count: {
                        select: {
                            Booking: true,
                        },
                    },
                },
            },
        },
    });
}

async function findUsersRoom(roomId: number) {

    return prisma.booking.findMany({

        where: {
            roomId
        }

    });

}

async function findBookingById(id: number) {

    return prisma.booking.findFirst({

        where: {
            id
        },
        include: {
            Room: {
                include: {
                    Hotel: true,
                    Booking: true,
                },
            },
        },
    });

}

type CreateParams = Omit<Booking, "id" | "createdAt" | "updatedAt">;

async function createBooking({ roomId, userId }: CreateParams) {
    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    });
}

type UpdateParams = {
    id: number,
    roomId: number
}

async function updateBooking({ id, roomId }: UpdateParams) {

    return prisma.booking.update({ where: { id }, data: { roomId } });

}

const bookingRepository = {
    findBookingByUserId,
    createBooking,
    findUsersRoom,
    findBookingById,
    updateBooking
};

export default bookingRepository;