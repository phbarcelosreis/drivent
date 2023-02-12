import { prisma } from "@/config";

async function findBooking(userId: number) {
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

const bookingRepository = {
    findBooking
};

export default bookingRepository;