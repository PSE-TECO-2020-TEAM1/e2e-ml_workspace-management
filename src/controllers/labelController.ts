import { Request, Response } from "express"
import Label, { ILabel } from "../models/label";
import Workspace, { IWorkspace } from "../models/workspace";
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
    const alreadyExisting = await Label.findOne({"name": req.body.name, "workspaceId": workspace._id}).exec();
    if (alreadyExisting) {
        return res.status(400).send("Label already exists");
    }
    const label = {
        name: req.body.name as string,
        workspaceId: workspace._id
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
    // sample may belong to another workspace? they cannot because label is validated by workspace
    const samples = await Sample.find({"labelId": label._id}).exec();
    if (samples.length > 0) {
        workspace.lastModified = new Date();
    }
    const toBeRemoved = samples.map(s => s._id.toString()) as string[];
    workspace.labelIds = workspace.labelIds.filter(l => l !== label._id.toString());
    workspace.sampleIds = workspace.sampleIds.filter(s => !toBeRemoved.includes(s));
    // Workspace.findByIdAndUpdate(workspace._id, {$pull: {"labelIds": label._id.toString()}});
    // Workspace.findByIdAndUpdate(workspace._id, {$pullAll: {"sampleIds": sampleIds}});
    // workspace.updateOne({$pull: {"labelIds": label._id}});
    // workspace.updateOne({$pullAll: {"sampleIds": sampleIds}})
    samples.forEach(s => s.remove());
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