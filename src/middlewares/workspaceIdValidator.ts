import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const workspaceIdValidator = (req: Request, res: Response, next : NextFunction) => {
    const workspaceId = req.params.workspaceId as string;
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).send("Invalid workspace id");
    }
    next();
}