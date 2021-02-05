import { Request, Response } from "express";
import { IDataPoint, ISample, ISensorDataPoints, ITimeFrame } from "../models/sample";
import Workspace, { IWorkspace } from "../models/workspace";

interface GetSamplesResponseBody {
    [ index: number ]: {
        label: string,
        sensorDataPoints: {
            sensorId: string,
            dataPoints?: {
                data: number[]
            }[]
        }[]
    }
}

// TODO: changes to API doc on query names
// return format unclear in API doc
export const getSamples = async (req: Request, res: Response) => {
    const workspace = res.locals.workspace as IWorkspace;
    const onlyDate = (req.query.onlyDate === "true");
    const showDataPoints = (req.query.showDataPoints === "true");
    if (onlyDate) {
        console.log(workspace.lastChangeDate.getTime());
        return res.status(200).json(workspace.lastChangeDate.getTime());
    }
    const samples = workspace.samples;
    // TODO: hide _id from response
    if (showDataPoints) {
        const formattedSamples = samples.map(s => ({
            label: s.label.name,
            sensorDataPoints: s.allSensorDataPoints
        }));
        return res.status(200).json(formattedSamples);
    }
    const formattedSamples = samples.map(s => ({
        label: s.label.name,
        sampleId: s._id 
    }));
    res.status(200).json(formattedSamples);
}

// TODO: changes to API doc, submisionId in body, neden bodyde pathte olsun
interface PostSubmitSampleRequestBody {
    submissionId: string,
    label: string,
    start: number,
    end: number,
    sensorDataPoints: {
        sensor: string,
        dataPoints: {
            timestamp: number,
            data: number[]
         }[] //TODO: data number[] or string[] to keep it consistent
    }[]
}

// TODO: change to API doc, return sample id 
// timeframes ne olacak ilk yollandiginda
export const postSubmitSample = async (req: Request, res: Response) => {
    const body = req.body as PostSubmitSampleRequestBody;
    const workspace = await Workspace.findOne({"submissionIds.hash": body.submissionId}).exec();
    const label = workspace.labels.find(l => l.name === body.label);
    const start = body.start;
    const end = body.end;
    if (!workspace) {
        return res.status(400).send("No workspace matched with given submission id");
    }
    if (!label) {
        return res.status(400).send("This label does not exist");
    }
    if (start >= end) {
        return res.status(400).send("Start time cannot be later than end time");
    }
    body.sensorDataPoints.forEach(d => {
        if (!workspace.sensors.some(s => s.sensorType.name === d.sensor)) {
            return res.status(400).send("This sensor does not belong to the workspace");
        }
    });
    
    let sensorDataPoints : ISensorDataPoints[] = [];
    for (const sensorDataPoint of body.sensorDataPoints) {
        const sensorId = workspace.sensors.find(s => s.sensorType.name === sensorDataPoint.sensor)._id as string;
        const dataPoints = sensorDataPoint.dataPoints as IDataPoint[];
        const formattedSensorDataPoint = {
            sensorId: sensorId,
            dataPoints: dataPoints
        } as ISensorDataPoints
        sensorDataPoints.push(formattedSensorDataPoint);
    }

    const sample : ISample = {
        start: start,
        end: end,
        label: label,
        allSensorDataPoints: sensorDataPoints,
        timeFrames: []
    } as ISample;
    workspace.samples.push(sample);
    workspace.lastChangeDate = new Date();
    workspace.save();
    res.sendStatus(200);
}


// TODO: bring to the right format
export const getSample = async (req: Request, res: Response) => {
    res.status(200).json(res.locals.sample);
}

export const deleteSample = async (req: Request, res: Response) => {
    const sample = res.locals.sample as ISample;
    const workspace = res.locals.workspace as IWorkspace;
    await sample.remove();
    workspace.save();
    res.sendStatus(200);
}

export const putRelabelSample = async (req: Request, res: Response) => {
    const sample = res.locals.sample as ISample;
    const workspace = res.locals.workspace as IWorkspace;
    const labelId = req.query.labelId;
    const label = workspace.labels.find(l => l._id.toString() === labelId);
    if (!label) {
        return res.status(400).send("Label with given id does not exist in the workspace");
    }
    sample.label = label;
    workspace.save();
    res.sendStatus(200);
}

interface PutChangeTimeFramesBody {
    [ index: number ]: {
        start: number,
        end: number
    }
}

// TODO: hide _id
export const putChangeTimeFrames = async (req: Request, res: Response) => {
    const sample = res.locals.sample as ISample;
    const workspace = res.locals.workspace as IWorkspace;
    const body = req.body as PutChangeTimeFramesBody;
    let timeFrames: ITimeFrame[] = [];
    for (const timeframe of Object.values(body)) {
        timeFrames.push(timeframe);
    }
    sample.timeFrames = timeFrames;
    workspace.save();
    res.sendStatus(200);
}