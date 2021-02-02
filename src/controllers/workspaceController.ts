import { Request, response, Response } from "express"
import Workspace from "../models/workspace"
import Sensor, { ACCELEROMETER, GYROSCOPE, MAGNETOMETER, SensorType } from "../models/sensor"

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

// needed or unnecessary ?
interface GetWorkspacesResponseBody {
    [index: number ]: {
        id: string,
        name: string
    }
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

interface CreateWorkspaceRequestBody {
    name: string,
    userId: string,
    sensors: {
        sensorName: string,
        samplingRate: number
    }[]
}