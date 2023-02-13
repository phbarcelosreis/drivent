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

type CreateParams = Omit<Booking, "id" | "createdAt" | "updatedAt">;

async function createBooking({ roomId, userId }: CreateParams) {
    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    });
}

const bookingRepository = {
    findBookingByUserId,
    createBooking,
    findUsersRoom
};

export default bookingRepository;