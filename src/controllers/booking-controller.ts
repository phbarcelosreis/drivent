import { Request, Response } from "express";

function getBooking(req: Request, res: Response){

    res.send({message: "teste"})

}

export {
    getBooking
}