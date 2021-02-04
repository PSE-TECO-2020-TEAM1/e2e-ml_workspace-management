import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const labelIdValidator = (req: Request, res: Response, next : NextFunction) => {
    const labelId = req.params.labelId as string;
    if (!mongoose.Types.ObjectId.isValid(labelId)) {
        return res.status(400).send("Invalid label id");
    }
    next();
}