import { Request, Response } from "express"
import Label, { ILabel } from "../models/label";
import { IWorkspace } from "../models/workspace";
import Sample, { ISample } from "../models/sample";
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
    const labels = await Promise.all(workspace.labelIds.map(async l => {
        const label = await Label.findById(l).exec();
        return {
            labelId: l,
            name: label.name,
            description: label.description
        }
    }));
    res.status(200).send(labels);
}

export const postCreateLabel = async (req: Request, res: Response) => {
    const workspace = res.locals.workspace as IWorkspace;
    const alreadyExisting = await Label.findOne({"name": req.body.name}).exec();
    if (workspace.labelIds.includes(alreadyExisting._id)) {
        return res.status(400).send("Label already exists");    
    }
    const label = {
        name: req.body.name as string,
        description: null as string
    } as ILabel;
    const labelId = (await Label.create(label))._id;
    workspace.labelIds.push(labelId);
    workspace.save();
    res.sendStatus(200);
}

// TODO after sample part complete
export const deleteLabel = async (req: Request, res: Response) => {
    const workspace = res.locals.workspace as IWorkspace;
    const label = res.locals.label as ILabel;
    // sample may belong to another workspace?
    const samples = await Sample.find({"labelId": label._id}).exec();
    if (samples.length > 0) {
        workspace.lastModified = new Date();
    }
    samples.forEach(s => s.remove());
    workspace.labelIds = workspace.labelIds.filter(l => l !== label._id.toString());
    label.remove();
    workspace.save();
    res.sendStatus(200);
}

export const putRenameLabel = async (req: Request, res: Response) => {
    const label = res.locals.label as ILabel;
    const newName = req.query.labelName as string;
    if (!newName || newName === '' /* || newName.length > MAX_LENGTH */) {
        return res.status(400).send("Name is invalid");
    }
    label.name = newName;
    label.save();
    res.sendStatus(200);
}

export const putDescribeLabel = async (req: Request, res: Response) => {
    const label = res.locals.label as ILabel;
    const description = req.query.description as string;
    if (!description || description === '' /* || description.length > MAX_LENGTH */) {
        return res.status(400).send("Description is invalid");
    }
    label.description = description;
    label.save();
    res.sendStatus(200);
}