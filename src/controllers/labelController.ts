import { Request, Response } from "express"
import { ILabel } from "../models/label";
import { IWorkspace } from "../models/workspace";

interface GetLabelsRequestBody {
    [ index : number ]: {
        labelId: string,
        name: string,
        description: string
    }
}

export const getLabels = async (req: Request, res: Response) => {
    const workspace = res.locals.workspace as IWorkspace;
    const labels = workspace.labels.map(l => ({
        labelId: l._id,
        name: l.name,
        description: l.description
    }));
    res.status(200).send(labels);
}

export const postCreateLabel = async (req: Request, res: Response) => {
    const workspace = res.locals.workspace as IWorkspace;
    const newLabel = {
        name: req.body.name as string,
        description: null as string
    } as ILabel;
    workspace.labels.push(newLabel);
    workspace.save();
    res.sendStatus(200);
}