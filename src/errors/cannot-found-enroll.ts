import { ApplicationError } from "@/protocols";

export function enrollmentNotFound(): ApplicationError {
  return {
    name: "EnrollmentNotFound",
    message: "User don't have a enrollment! ",
  };
}