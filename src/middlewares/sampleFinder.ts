import { Request, Response, NextFunction } from "express";
import Workspace, { IWorkspace } from "../models/workspace";

export const sampleFinder = async (req: Request, res: Response, next: NextFunction) => {
    const workspace = res.locals.workspace as IWorkspace;
    // toString() seems like a workaround
    const sample = workspace.samples.find(s => s._id.toString() === req.params.sampleId);
	if (!sample) {
		return res.status(400).send("Sample with given id does not exist");
	}
	res.locals.sample = sample;
	next();
};
