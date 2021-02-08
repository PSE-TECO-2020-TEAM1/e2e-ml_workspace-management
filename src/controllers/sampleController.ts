import { Request, Response } from "express";
import Sample, { IDataPoint, ISample, ISensorDataPoints, ITimeFrame} from "../models/sample";
import Workspace, { IWorkspace } from "../models/workspace";
import Label from "../models/label";
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
        return res.status(200).json(workspace.lastModified.getTime());
    }
    const sampleIds = workspace.sampleIds;
    const samples = await Sample.find().where("_id").in(sampleIds).exec() as ISample[];
    // TODO: hide _id from response
    if (showDataPoints) {
        const formattedSamples = await Promise.all(samples.map(async s => (
            {
            label: (await Label.findById(s.labelId)).name,
            sensorDataPoints: s.allSensorDataPoints,
            timeFrames: s.timeFrames
        })));
        return res.status(200).json(formattedSamples);
    }
    const formattedSamples = await Promise.all(samples.map(async s => ({
        label: (await Label.findById(s.labelId)).name,
        sampleId: s._id 
    })));
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
    if (!workspace) {
        return res.status(400).send("No workspace matched with given submission id");
    }

    const label = await Label.findOne({name: body.label}).exec();
    if (!label) {
        return res.status(400).send("This label does not exist");
    }

    const labelId = workspace.labelIds.find(l => l === label._id.toString());
    if (!labelId) {
        return res.status(400).send("This label does not belong to the workspace");
    }

    const start = body.start;
    const end = body.end;
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

    const timeFrame = {
        start: start,
        end: end
    } as ITimeFrame;

    const sample : ISample = {
        start: start,
        end: end,
        labelId: labelId,
        allSensorDataPoints: sensorDataPoints,
        timeFrames: [timeFrame]
    } as ISample;
    
    const sampleId = (await Sample.create(sample))._id;

    workspace.sampleIds.push(sampleId);
    workspace.lastModified = new Date();
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
    workspace.lastModified = new Date();
    workspace.sampleIds = workspace.sampleIds.filter(s => s !== sample._id.toString());
    sample.remove();
    workspace.save();
    res.sendStatus(200);
}

export const putRelabelSample = async (req: Request, res: Response) => {
    const sample = res.locals.sample as ISample;
    const workspace = res.locals.workspace as IWorkspace;
    const labelId = req.query.labelId as string;
    const label = await Label.findById(labelId).exec();
    if (!label) {
        return res.status(400).send("Label with given id does not exist");
    }
    if (!workspace.labelIds.includes(labelId)) { // change message to make it consistent with labelFinder
        return res.status(400).send("This label does not belong to the workspace");
    }

    sample.labelId = labelId;
    sample.save();
    workspace.lastModified = new Date();
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
    let i = 0;
    for (const timeframe of Object.values(body)) {
        if (timeframe.start >= timeframe.end) {
            return res.status(400).send("Timeframe start should be earlier than end");
        }
        if (i > 0 && timeFrames[i-1].start >= timeframe.start) {
            return res.status(400).send("Timeframes are not sorted");
        }
        if (i > 0 && timeFrames[i-1].end >= timeframe.start) {
            return res.status(400).send("Timeframes should not be intersecting with each other");
        }
        timeFrames.push(timeframe);
        i++;
    }
    sample.timeFrames = timeFrames;
    sample.save();
    workspace.lastModified = new Date();
    workspace.save();
    res.sendStatus(200);
}