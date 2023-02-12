import faker from "@faker-js/faker";
import { prisma } from "@/config";

//Sabe criar objetos - Hotel do banco
export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    }
  });
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: "1020",
      capacity: 3,
      hotelId: hotelId,
    }
  });
}

type RoomData = {
  name: string;
  capacity: number;
}

export async function createHotelWithRooms() {
  const roomData: RoomData[] = [
    { name: faker.datatype.number().toString(), capacity: 1 },
    { name: faker.datatype.number().toString(), capacity: 2 },
  ];

  const hotel = await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.city(),
      Rooms: {
        createMany: {
          data: roomData,
        },
      },
    },
    include: { Rooms: { orderBy: { id: 'asc' } } },
  });

  return hotel;
}