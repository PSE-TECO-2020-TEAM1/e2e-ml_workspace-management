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
        return res.status(200).send(workspace.sample.lastChangeDate.getUTCMilliseconds);
    }

}

// TODO: changes to API doc, workspaceId in body, neden bodyde pathte olsun
interface PostSubmitSampleRequestBody {
    workspaceId: string,
    label: string,
    start: number,
    end: number,
    sensorDataPoints: {
        sensor: string,
        dataPoints: number[] //TODO: number or string to keep it consistent
    }[]
}

// WorkspaceId neden bodyde pathte olsun
export const postSubmitSample = async (req: Request, res: Response) => {
    const body = req.body as PostSubmitSampleRequestBody;
    // const workspace = await Workspace.find
}