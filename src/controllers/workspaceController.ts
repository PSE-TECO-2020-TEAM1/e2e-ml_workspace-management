import { Request, Response } from "express"
import request from "superagent";
import dotenv from "dotenv"
import Workspace, { ISubmissionId, IWorkspace } from "../models/workspace"
import { SensorType, SENSOR_TYPES } from "../models/sensor"
import Label from "../models/label";
import crypto from "crypto";
import { body, param, query, ValidationChain } from "express-validator";

dotenv.config();
interface RequestValidator {
    postCreateWorkspace: Array<ValidationChain>,
    putRenameWorkspace: Array<ValidationChain>
}

export let validator: RequestValidator = {
    postCreateWorkspace: [],
    putRenameWorkspace: []
};
interface GetWorkspacesResponseBody {
    [ index: number ]: {
        id: string,
        name: string
    }
}

export const getWorkspaces = async (req: Request, res: Response) => {
    const userId = res.locals.userId as string;
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
    sensors: {
        sensorName: string,
        samplingRate: number
    }[]
}

validator.postCreateWorkspace = [
    body("name").exists().isString(),
    body("sensors").exists().isArray().notEmpty(),
    body("sensors.*.sensorName").exists().isString(),
    body("sensors.*.samplingRate").exists().isNumeric()
]
// TODO: change to API doc, returns 400 in case of duplicate sensor
// add functionality: return 400 when unknown sensorType is received
export const postCreateWorkspace = async (req: Request, res: Response) => {
    const body: CreateWorkspaceRequestBody = req.body;
    let sensors: {
        sensorType: SensorType,
        samplingRate: number
    }[] = [];
    let formattedSensors: {
        name: string,
        samplingRate: number,
        dataFormat: readonly string[]
    }[] = [];

    const userId = res.locals.userId;
    for (const sensor of body.sensors) {
        const sensorType = SENSOR_TYPES.find(t => t.name === sensor.sensorName); 
        if (!sensorType) {
            return res.status(400).json("Invalid sensor type");
        }
        // can use more clear error messages
        if (sensorType.maxSamplingRate < sensor.samplingRate || sensor.samplingRate <= 0) {
            return res.status(400).json("Invalid sensor sampling rate");
        }
        sensors.push({sensorType:sensorType, samplingRate:sensor.samplingRate});
        formattedSensors.push({
            name: sensorType.name,
            samplingRate: sensor.samplingRate,
            dataFormat: sensorType.dataFormat
        });
    }
    for (const type of SENSOR_TYPES) {
        const countType = sensors.filter(s => s.sensorType.name === type.name).length;
        if (countType > 1) {
            return res.status(400).json("Cannot create workspace with duplicate sensors");
        }
    }
    const workspace = await Workspace.create({
        name: body.name,
        userId: userId,
        sensors: sensors,
        lastModified: new Date()
    });

    // send request to the model-management
    const requestBody = {
        workspaceId: workspace._id,
        sensors: formattedSensors
    }

    try {
     await request
        .post(`${process.env.MODEL_MANAGEMENT_HOST}:${process.env.MODEL_MANAGEMENT_PORT}/api/workspaces/createModelWorkspace`)
        .set("Content-Type", "application/json")
        .set("Authorization", req.headers.authorization)
        .send(requestBody)
    } catch(err) {
        workspace.remove();
        return res.status(400).json("Model management could not create a workspace"); 
    }
    res.status(200).json(workspace._id);
}

validator.putRenameWorkspace = [
    param("workspaceId").exists().isString(),
    query("workspaceName").exists().isString().notEmpty()
]

// TODO: put methods success status 201
export const putRenameWorkspace = async (req : Request, res : Response) => {
    const workspaceName = req.query.workspaceName as string;
    const workspace = res.locals.workspace as IWorkspace;
    workspace.name = workspaceName;
    workspace.save(); // await ?
    res.sendStatus(200);
}

export const deleteWorkspace = async (req : Request, res: Response) => {
    const workspace = res.locals.workspace as IWorkspace;
    workspace.remove(); // await ?
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
    res.status(200).json(submissionId.hash);
}

interface GetSubmissionConfigResponseBody {
    sensors: {
        name: string,
        samplingRate: number
    }[],
    labels: {
        id: string,
        name: string,
        description: string
    }[]
}

export const getSubmissionConfig = async (req: Request, res: Response) => {
    const submissionId = req.query.submissionId;
    const workspace = await Workspace.findOne({"submissionIds.hash": submissionId}).exec();
    if (!workspace) {
        return res.status(400).json("Workspace with given submission id does not exist");
    }
    const formattedSensors = workspace.sensors.map(s => ({
        name: s.sensorType.name,
        samplingRate: s.samplingRate
    }));
    const formattedLabels = await Promise.all(workspace.labelIds.map(async l => {
        const label = await Label.findById(l).exec();
        return {
            id: label._id,
            name: label.name,
            description: label.description
        }
    }));
    const config: GetSubmissionConfigResponseBody = {sensors: formattedSensors, labels: formattedLabels};
    res.status(200).json(config);
}