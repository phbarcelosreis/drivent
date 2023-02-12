import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createUser, createBooking, createHotelWithRooms } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
    await init();
    await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
    it("should respond with status 401 if no token is given",
        async () => {

            const response = await server.get("/booking");

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);

        });

    it("should respond with status 401 if token is invalid",
        async () => {
            const token = faker.lorem.word();

            const response = await server.get("/booking").set("Authorization", `Bearer${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);

        });

    it("should respond with status 401 if there is no session with given token",
        async () => {

            const userWithoutSession = await createUser();
            const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

            const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);

        });

    describe("when token is valid", () => {
        it("should respond with status 404 when there is no booking for given user",
            async () => {

                const user = await createUser();
                const token = await generateValidToken(user);

                const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

                expect(response.status).toBe(httpStatus.NOT_FOUND);

            });

        it("should respond with status 200 and list the booking data when there is a booking for given user",
            async () => {

                const user = await createUser();
                const token = await generateValidToken(user);
                const hotel = await createHotelWithRooms();
                const booking = await createBooking(hotel.Rooms[0].id, user.id);

                const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

                expect(response.status).toBe(httpStatus.OK);
                expect(response.body).toEqual({
                    bookingId: booking.id,
                    hotel: {
                        id: hotel.id,
                        name: hotel.name,
                        image: hotel.image,
                    },
                    room: {
                        id: hotel.Rooms[0].id,
                        name: hotel.Rooms[0].name,
                        capacity: hotel.Rooms[0].capacity,
                        hotelId: hotel.Rooms[0].hotelId,
                        booked: 1,
                    }
                });

            });

    });



});

describe("POST /booking", () => {

    it("should respond with status 401 if no token is given",
        async () => {

            const response = await server.post("/booking");

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);

        });

    it("should respond with status 401 if token is invalid",
        async () => {
            const token = faker.lorem.word();

            const response = await server.post("/booking").set("Authorization", `Bearer${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);

        });

    it("should respond with status 401 if there is no session with given token",
        async () => {

            const userWithoutSession = await createUser();
            const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);

        });

    /*         describe("when token is valid", () => {
                it("",
                    async () => {
    
                        const user = await createUser();
                        const token = await generateValidToken(user);
    
                        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    
                        expect(response.status).toBe(httpStatus.NOT_FOUND);
    
                    });
            }); */
});