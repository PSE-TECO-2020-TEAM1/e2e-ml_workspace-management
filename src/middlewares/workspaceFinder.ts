import { Request, Response, NextFunction } from "express";
import Workspace from "../models/workspace";

export const workspaceFinder = async (req: Request, res: Response, next: NextFunction) => {
	const workspace = await Workspace.findById(req.params.workspaceId).exec();
	if (!workspace) {
		return res.status(400).send("Workspace with given id does not exist");
	}
	res.locals.workspace = workspace;
	next();
};
