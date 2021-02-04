import { request, Request, Response } from "express"
import { ILabel } from "../models/label";
import { IWorkspace } from "../models/workspace";

interface GetLabelsRequestBody {
    [ index : number ]: {
        labelId: string,
        name: string,
        description: string
    }
}
// labels as GetLabelsRequestBody 
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

// TODO after sample part complete
// export const deleteLabel = async (req: Request, res: Response) => {
// 
// }

export const putRenameLabel = async (req: Request, res: Response) => {
    const workspace = res.locals.workspace as IWorkspace;
    const label = res.locals.label as ILabel;
    const newName = req.query.labelName as string;
    if (!newName || newName === '' /* || newName.length > MAX_LENGTH */) {
        return res.status(400).send("Name is invalid");
    }
    label.name = newName;
    workspace.save();
    res.sendStatus(200);
}