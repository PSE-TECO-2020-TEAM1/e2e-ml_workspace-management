import { Request, response, Response } from "express"
import { ObjectId } from "mongoose"
import Workspace from "../models/workspace"
import Sensor, { ACCELEROMETER, GYROSCOPE, MAGNETOMETER, SensorType } from "../models/sensor"

export const getWorkspaces = async (req: Request, res: Response) => {
    const IDs = Workspace.find().exec();
    const names = Workspace.find().exec();
    // const responseJson: GetWorkspacesResponseBody = {IDs, names};
    // res.status(200).json(responseJson);
}

interface GetWorkspacesResponseBody {
    IDs: [ObjectId],
    names: [string]
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
    userId: number,
    sensors: {
        sensorName: string,
        samplingRate: number
    }[]
}