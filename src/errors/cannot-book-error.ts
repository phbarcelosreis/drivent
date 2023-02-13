import { ApplicationError } from "@/protocols";

export function cannotBookingError(): ApplicationError {
  return {
    name: "CannotBookingError",
    message: "This room is in Overcapacity! Cannot Booking this room!",
  };
}