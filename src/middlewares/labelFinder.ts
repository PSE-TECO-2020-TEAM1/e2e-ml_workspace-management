import { Request, Response, NextFunction } from "express";
import Workspace, { IWorkspace } from "../models/workspace";

export const labelFinder = async (req: Request, res: Response, next: NextFunction) => {
    const workspace = res.locals.workspace as IWorkspace;
    // toString() seems like a workaround
    const label = workspace.labels.find(l => l._id.toString() === req.params.labelId);
	if (!label) {
		return res.status(400).send("Label with given id does not exist");
	}
	res.locals.label = label;
	next();
};
