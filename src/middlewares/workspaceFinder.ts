import { Request, Response, NextFunction } from "express";
import Workspace from "../models/workspace";

export const workspaceFinder = async (req: Request, res: Response, next: NextFunction) => {
	const workspace = await Workspace.findById(req.params.workspaceId).exec();
	if (!workspace) {
		return res.status(400).json("Workspace with given id does not exist");
	}
	if (workspace.userId !== res.locals.userId) {
		return res.sendStatus(401);
	}
	res.locals.workspace = workspace;
	next();
};
