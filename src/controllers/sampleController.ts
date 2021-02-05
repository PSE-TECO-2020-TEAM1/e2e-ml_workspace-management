import { Request, Response } from "express";
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



// TODO: changes to API doc 
export const getSamples = async (req: Request, res: Response) => {
    const workspace = res.locals.workspace as IWorkspace;
    const onlyDate = (req.query.onlyDate === "true");
    const showDataPoints = (req.query.showDataPoints === "true");
    if (onlyDate) {
        return res.status(200).send(workspace.lastChangeDate.getUTCMilliseconds());
    }
    const samples = workspace.samples;
}

// TODO: changes to API doc, workspaceId in body, neden bodyde pathte olsun
interface PostSubmitSampleRequestBody {
    submissionId: string,
    label: string,
    start: number,
    end: number,
    sensorDataPoints: {
        sensor: string,
        dataPoints: number[] //TODO: number or string to keep it consistent
    }[]
}

// 
export const postSubmitSample = async (req: Request, res: Response) => {
    const body = req.body as PostSubmitSampleRequestBody;
    const workspace = await Workspace.findOne({"submissionIds.hash": body.submissionId}).exec();
    const labelName = body.label;
    const start = body.start;
    const end = body.end;
    console.log(workspace);
    if (!workspace) {
        // console.log("GG");
        return res.status(400).send("No workspace matched with given submission id");
    }
    if (!workspace.labels.some(l => l.name === labelName)) {
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
    // body.sensorDataPoints.forEach(d => {
        // workspace.sample.allSensorDataPoints.push({
            // name
        // });
    // });
    

}