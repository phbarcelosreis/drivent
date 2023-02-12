import { prisma } from "@/config";

async function findBooking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId: userId
    }
  });
}

const bookingRepository = {
  findBooking
};

export default bookingRepository;