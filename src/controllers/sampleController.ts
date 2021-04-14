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
            timeFrames: s.timeFrames,
            start: s.start,
            end: s.end
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
// TODO: sample data points consistency check, data timestamp between start-end
export const postSubmitSample = async (req: Request, res: Response) => {
    const body = req.body as PostSubmitSampleRequestBody;
    const workspace = await Workspace.findOne({"submissionIds.hash": body.submissionId}).exec();
    if (!workspace) {
        return res.status(400).json("No workspace matched with given submission id");
    }

    const label = await Label.findOne({name: body.label, workspaceId: workspace._id}).exec();
    if (!label) {
        return res.status(400).json("This label does not exist");
    }

    const start = Math.trunc(body.start);
    const end = Math.trunc(body.end);
    if (start >= end) {
        return res.status(400).json("Start time cannot be later than end time");
    }

    for (const sensorDataPoint of body.sensorDataPoints) {
        if (!workspace.sensors.some(s => s.sensorType.name === sensorDataPoint.sensor)) {
            return res.status(400).json("This sensor does not belong to the workspace");
        }
    }
    
    let sensorDataPoints : ISensorDataPoints[] = [];
    const usedSensors : Set<String> = new Set();
    for (const sensorDataPoint of body.sensorDataPoints) {
        const sensor = workspace.sensors.find(s => s.sensorType.name === sensorDataPoint.sensor);
        const dataPoints = sensorDataPoint.dataPoints as IDataPoint[];
        const unmatchingFormat = dataPoints.find(d => d.data.length !== sensor.sensorType.dataFormat.length);
        const invalidTimestamp = dataPoints.find(d => (d.timestamp > end || d.timestamp < start));
        
        usedSensors.add(sensor.sensorType.name);
        if (unmatchingFormat) {
            return res.status(400).json("Data format does not match the sensor's");
        }
        if (invalidTimestamp) {
            return res.status(400).json("Sample includes data with an erroneous timestamp");
        }

        const formattedSensorDataPoint = {
            sensorId: sensor._id,
            sensorName: sensor.sensorType.name,
            dataPoints: dataPoints
        } as ISensorDataPoints
        sensorDataPoints.push(formattedSensorDataPoint);
    }

    const unusedSensors = workspace.sensors.filter(s => !usedSensors.has(s.sensorType.name));
    if(unusedSensors.length > 0) {
        return res.status(400).json("Sample has missing sensor data");
    }

    const timeFrame = {
        start: start,
        end: end
    } as ITimeFrame;

    const sample : ISample = {
        start: start,
        end: end,
        labelId: label._id,
        allSensorDataPoints: sensorDataPoints,
        timeFrames: [timeFrame]
    } as ISample;
    
    const sampleId = (await Sample.create(sample))._id;
    label.sampleCount++;
    label.save();
    workspace.sampleIds.push(sampleId);
    workspace.lastModified = new Date();
    workspace.save();
    res.status(200).json(sampleId);
}

export const getSample = async (req: Request, res: Response) => {
    const sample = res.locals.sample as ISample;
    const label = await Label.findById(sample.labelId).exec();
    const formattedSample = {
        label: label.name,
        start: sample.start,
        end: sample.end,
        sensorDataPoints: sample.allSensorDataPoints,
        timeFrames: sample.timeFrames
    }
    res.status(200).json(formattedSample);
}

export const deleteSample = async (req: Request, res: Response) => {
    const sample = res.locals.sample as ISample;
    const workspace = res.locals.workspace as IWorkspace;
    const label = await Label.findById(sample.labelId).exec();
    workspace.lastModified = new Date();
    workspace.sampleIds = workspace.sampleIds.filter(s => s !== sample._id.toString());
    label.sampleCount--;
    label.save();
    sample.remove();
    workspace.save();
    res.sendStatus(200);
}

export const putRelabelSample = async (req: Request, res: Response) => {
    const sample = res.locals.sample as ISample;
    const workspace = res.locals.workspace as IWorkspace;
    const labelName = req.query.label as string;
    const label = await Label.findOne({name: labelName, workspaceId: workspace._id}).exec();
    if (!label) {
        return res.status(400).json("Label with does not exist in the workspace");
    }
    const oldLabel = await Label.findById(sample.labelId).exec();
    oldLabel.sampleCount--;
    oldLabel.save();
    label.sampleCount++;
    label.save();
    sample.labelId = label._id;
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
    let timeFrames: ITimeFrame[] = Object.values(body);

    for (let i = 0; i < timeFrames.length; ++i) {
        timeFrames[i].start = Math.trunc(timeFrames[i].start);
        timeFrames[i].end = Math.trunc(timeFrames[i].end);
    }

    timeFrames.sort((a, b) => {
        if (a.start === b.start) return a.end - b.end; //this means they're intersecting actually
        return a.start - b.start;
    });
    
    if (timeFrames.length && (timeFrames[0].start < sample.start || timeFrames[timeFrames.length - 1].end > sample.end)) {
        return res.status(400).json("Timeframes should be between the start and the end of the sample");
    }
    for (let i = 0; i < timeFrames.length; ++i) {
        if (timeFrames[i].start >= timeFrames[i].end) {
            return res.status(400).json("Timeframe start should be earlier than end");
        }
        if (i > 0 && timeFrames[i-1].end >= timeFrames[i].start) {
            return res.status(400).json("Timeframes should not be intersecting with each other");
        }
    }
    sample.timeFrames = timeFrames;
    sample.save();
    workspace.lastModified = new Date();
    workspace.save();
    res.sendStatus(200);
}
