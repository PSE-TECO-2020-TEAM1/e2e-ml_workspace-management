import { Request, Response } from "express"
import Workspace, { ISubmissionId, IWorkspace } from "../models/workspace"
import { ACCELEROMETER, GYROSCOPE, MAGNETOMETER, SensorType } from "../models/sensor"
import crypto from "crypto";

interface GetWorkspacesResponseBody {
    [ index: number ]: {
        id: string,
        name: string
    }
}

export const getWorkspaces = async (req: Request, res: Response) => {
    const userId = req.query.userId as string; // this line might cause problems later ?
    const workspaces = await Workspace.find({userId: userId}).exec();
    const formattedWorkspaces : GetWorkspacesResponseBody = workspaces.map(w => (
        {
            id: w._id,
            name: w.name
        }
    ));
    res.status(200).json(formattedWorkspaces);
}
interface CreateWorkspaceRequestBody {
    name: string,
    userId: string,
    sensors: {
        sensorName: string,
        samplingRate: number
    }[]
}

// TODO: change to API doc, returns 400 in case of duplicate sensor
// add functionality: return 400 when unknown sensorType is received
export const postCreateWorkspace = async (req: Request, res: Response) => {
    const body: CreateWorkspaceRequestBody = req.body;
    // do i need to check if such an user exists and how ?
    // const user = await Workspace.findOne({userId: body.userId}).exec();
    // if(!user) {
        // return res.status(400).send("");
    // }
    let sensors = [];
    for (const sensor of body.sensors) {
        let sensorType : SensorType;
        switch (sensor.sensorName) {
            case "Accelerometer": sensorType = ACCELEROMETER; break;
            case "Gyroscope": sensorType = GYROSCOPE; break;
            case "Magnetometer": sensorType = MAGNETOMETER; break;
        }
        sensors.push({sensorType:sensorType, samplingRate:sensor.samplingRate});
    }
    if (
        sensors.filter(s => s.sensorType.name === "Accelerometer").length > 1 || 
        sensors.filter(s => s.sensorType.name === "Gyroscope").length > 1 ||
        sensors.filter(s => s.sensorType.name === "Magnetometer").length > 1
    ) {
        return res.status(400).send("Cannot create workspace with duplicate sensors");        
    }
    const workspace = await Workspace.create({
        name: body.name,
        userId:body.userId,
        sensors: sensors,
        lastChangeDate: new Date()
    });
    res.status(200).json(workspace._id);
}

// does not handle the case where workspaceName is not provided
export const putRenameWorkspace = async (req : Request, res : Response) => {
    if (!req.query.workspaceName) {
        return res.status(400).send("Workspace name needs to be provided");
    }
    const workspaceName = req.query.workspaceName as string;
    const workspace = res.locals.workspace as IWorkspace;
    workspace.name = workspaceName;
    await workspace.save();
    res.sendStatus(200);
}

export const deleteWorkspace = async (req : Request, res: Response) => {
    const workspace = res.locals.workspace as IWorkspace;
    await workspace.remove();
    res.sendStatus(200);
}

interface GetWorkspaceSensorsResponseBody {
    [ index: number ]: {
        id: string,
        name: string,
        dataFormat: readonly string[],
        samplingRate: number
    }
}

export const getWorkspaceSensors = async (req : Request, res: Response) => {
    const workspace = res.locals.workspace as IWorkspace;
    const formattedSensors : GetWorkspaceSensorsResponseBody = workspace.sensors.map(s => (
        {
            id: s._id,
            name: s.sensorType.name,
            dataFormat: s.sensorType.dataFormat,
            samplingRate: s.samplingRate
        }
    ));
    res.status(200).json(formattedSensors);
}


// TODO: sways from API doc, in API doc get /submissionId
export const getGenerateSubmissionId = async (req: Request, res: Response) => {
    const workspace = res.locals.workspace as IWorkspace;
    const submissionId = {
        hash: crypto.randomBytes(16).toString("hex")
    } as ISubmissionId;
    workspace.submissionIds.push(submissionId);
    workspace.save(); // maybe await here
    res.status(200).send(submissionId.hash);
}

interface getSubmissionConfigResponseBody {
    sensors: [{
        name: string,
        samplingRate: number
    }],
    labels: [{
        name: string,
        description: string
    }]
}

export const getSubmissionConfig = async (req: Request, res: Response) => {
    const submissionId = req.query.submissionId;
    const workspace = await Workspace.findOne({"submissionIds.hash": submissionId}).exec();
    if (!workspace) {
        return res.status(400).send("Workspace with given submission id does not exist");
    }
    const formattedSensors = workspace.sensors.map(s => ({
        name: s.sensorType.name,
        samplingRate: s.samplingRate
    }));
    const formattedLabels = workspace.labels.map(l => ({
        name: l.name,
        description: l.description
    }));
    const config = {sensors: formattedSensors, labels: formattedLabels};
    res.status(200).json(config);
}