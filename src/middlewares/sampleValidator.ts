import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const sampleIdValidator = (req: Request, res: Response, next : NextFunction) => {
    const sampleId = req.params.sampleId as string;
    if (!mongoose.Types.ObjectId.isValid(sampleId)) {
        return res.status(400).send("Invalid sample id");
    }
    next();
}