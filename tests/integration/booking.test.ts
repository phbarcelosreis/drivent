import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createUser, createBooking, createHotelWithRooms, createEnrollmentWithAddress, createTicket, createTicketTypeHotel, generateValidTicket } from "../factories";
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

    describe("when body is valid", () => {
        it("should respond with status 403 if user does not have an enrollment",
            async () => {

                const token = await generateValidToken();

                const body = { roomId: 1 };

                const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

                expect(response.status).toBe(httpStatus.FORBIDDEN);
            });

    });

    it("should respond with status 403 if ticket does not have a valid ticket type", async () => {

        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeHotel(false);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const body = { roomId: 1 };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if ticket have a valid ticket type but is not paid", async () => {

        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeHotel();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const body = { roomId: 1 };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    describe("when ticket is valid", () => {
        it("should respond with status 404 if room id does not exist", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await generateValidTicket(user);
            await createHotelWithRooms();
            const body = { roomId: 1 };

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with status 200 and with created booking id", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await generateValidTicket(user);
            const hotel = await createHotelWithRooms();
            await createBooking(hotel.Rooms[0].id, user.id);

            const body = { roomId: hotel.Rooms[1].id };

            const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual({ bookingId: expect.any(Number) });
        });


    });


});

describe("PUT /booking/:bookingId", () => {
    it("should respond with status 401 if no token is given",
        async () => {
            const response = await server.put("/booking/1");

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

    it("should respond with status 401 if given token is not valid",
        async () => {
            const token = faker.lorem.word();

            const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

    it("should respond with status 401 if there is no session with given token",
        async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign({ user: userWithoutSession.id }, process.env.JWT_SECRET);

            const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

    describe("when token is valid", () => {
        it("should respond with status 404 if param bookingId is invalid",
            async () => {
                const token = await generateValidToken();
                const body = { roomId: 1 };

                const response = await server.put("/booking/0").set("Authorization", `Bearer ${token}`).send(body);

                expect(response.status).toBe(httpStatus.NOT_FOUND);
            });

        it("should respond with status 403 if user does not have a booking",
            async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                await generateValidTicket(user);
                await createHotelWithRooms();
                const body = { roomId: 1 };

                const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);

                expect(response.status).toBe(httpStatus.NOT_FOUND);
            });

        it("should respond with status 403 if user does not own booking",
            async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                await generateValidTicket(user);
                const hotel = await createHotelWithRooms();

                const otherUser = await createUser();
                const booking = await createBooking(hotel.Rooms[0].id, otherUser.id);

                const body = { roomId: 1 };

                const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

                expect(response.status).toBe(httpStatus.FORBIDDEN);
            });

        it("should respond with status 404 if room id does not exist",
            async () => {

                const user = await createUser();
                const token = await generateValidToken(user);
                await generateValidTicket(user);
                const hotel = await createHotelWithRooms();
                const booking = await createBooking(hotel.Rooms[0].id, user.id);

                const body = { roomId: 1 };

                const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

                expect(response.status).toBe(httpStatus.NOT_FOUND);
            });

        it("should respond with status 200 and with updated booking id",
            async () => {
                const user = await
                    createUser();
                const token = await generateValidToken(user);
                await generateValidTicket(user);
                const hotel = await createHotelWithRooms();
                const booking = await createBooking(hotel.Rooms[1].id, user.id);

                const body = { roomId: hotel.Rooms[0].id };

                const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

                expect(response.status).toBe(httpStatus.OK);
                expect(response.body).toEqual({ bookingId: booking.id });
            });

    });

});