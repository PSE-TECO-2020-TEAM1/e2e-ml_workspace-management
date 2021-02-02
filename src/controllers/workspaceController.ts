import { Request, Response } from "express"
import Workspace from "../models/workspace"
import Sensor, { ACCELEROMETER, GYROSCOPE, MAGNETOMETER, SensorType } from "../models/sensor"
import mongoose from "mongoose"

// needed or unnecessary ?
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
    const workspace = await Workspace.create({name: body.name, userId:body.userId, sensors: sensors});
    res.status(200).json(workspace._id);
}

// does not handle the case where workspaceName is not provided
export const putRenameWorkspace = async (req : Request, res : Response) => {
    const workspaceId = req.params.workspaceId as string; 
    const workspaceName = req.query.workspaceName as string;
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).send("Invalid workspace id");
    }
    const workspace = await Workspace.findById(workspaceId).exec();
    if (!workspace) {
        return res.status(400).send("Workspace with given id does not exist");
    }
    workspace.name = workspaceName;
    await workspace.save();
    res.sendStatus(200);
}

export const deleteWorkspace = async (req : Request, res: Response) => {
    const workspaceId = req.params.workspaceId as string;
    const workspace = await Workspace.findById(workspaceId).exec();
    if (!workspace) {
        return res.status(400).send("Workspace with given id does not exist");
    }
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
    const workspaceId = req.params.workspaceId as string;
    const workspace = await Workspace.findById(workspaceId).exec();
    if (!workspace) {
        return res.status(400).send("Workspace with given id does not exist");
    }
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