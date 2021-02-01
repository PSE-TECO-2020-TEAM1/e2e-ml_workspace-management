import { Request, response, Response } from "express"
import { ObjectId } from "mongoose"
import Workspace from "../models/workspace"
import Sensor, { SensorType } from "../models/sensor"

export const getWorkspaces = async (req: Request, res: Response) => {
    // const IDs = Workspace.find().exec();
    // const names = Workspace.find().exec();
    // const responseJson: GetWorkspacesResponseBody = {IDs, names};
    // res.status(200).json(responseJson);
}

interface GetWorkspacesResponseBody {
    IDs: [ObjectId],
    names: [string]
}

export const postCreateWorkspace = async (req: Request, res: Response) => {
    const body: CreateWorkspaceRequestBody = req.body;
    // const user = await Workspace.findOne({userId: body.userId}).exec();
    // if(!user) {
        // return res.status(400).send("");
    // }
    let sensors = [];
    for (const sensor of body.sensors) {
        let sensorType;
        switch (sensor.name) {
            case "Accelerometer": sensorType = SensorType.ACCELEROMETER;
            case "Gyroscope": sensorType = SensorType.GYROSCOPE;
            case "Magnetometer": sensorType = SensorType.MAGNETOMETER;
        }
        sensors.push({sensorType:sensorType, samplingRate:sensor.samplingRate});
    }

    Workspace.create({name: body.workspaceName, userId:body.userId, sensors: sensors});
    res.sendStatus(200);
}

interface CreateWorkspaceRequestBody {
    workspaceName: string,
    userId: number,
    sensors: {
        name: string,
        samplingRate: number
    }[]
}