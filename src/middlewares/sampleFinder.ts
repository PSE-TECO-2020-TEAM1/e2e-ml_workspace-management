import { Request, Response, NextFunction } from "express";
import { IWorkspace } from "../models/workspace";
import Sample from "../models/sample";

export const sampleFinder = async (req: Request, res: Response, next: NextFunction) => {
    const workspace = res.locals.workspace as IWorkspace;
	const sample = await Sample.findById(req.params.sampleId).exec();
	if (!sample) {
		return res.status(400).send("Sample with given id does not exist");
	}
	if (!workspace.sampleIds.includes(sample._id)) {
		return res.status(400).send("Sample with given id does not belong to the workspace");
	}
	res.locals.sample = sample;
	next();
};
