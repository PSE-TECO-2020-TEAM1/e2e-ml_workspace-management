import { Request, Response, NextFunction } from "express";
import Workspace, { IWorkspace } from "../models/workspace";
import Label from "../models/label";

export const labelFinder = async (req: Request, res: Response, next: NextFunction) => {
    const workspace = res.locals.workspace as IWorkspace;
    const label = await Label.findById(req.params.labelId).exec();
	if (!label) {
		return res.status(400).json("Label with given id does not exist");
	}
	if (!workspace.labelIds.includes(label._id)) {
		return res.status(400).json("Label with given id does not belong to the workspace");
	}
	res.locals.label = label;
	next();
};
