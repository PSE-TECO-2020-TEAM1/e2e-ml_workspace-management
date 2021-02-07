import mongoose from "mongoose"
import { ISensor, SensorSchema } from "./sensor";
import { ILabel, LabelSchema } from "./label";
import { ISample, SampleSchema } from "./sample";

// provides flexibility, expiration date etc. can be added later
export interface ISubmissionId extends mongoose.Document {
    hash: string
}
export interface IWorkspace extends mongoose.Document {
    name: string,
    userId: string,
    submissionIds: ISubmissionId[],
    sensors: ISensor[],
    labels: ILabel[],
    samples: ISample[],
    lastModified: Date
}

const SubmissionIdSchema = new mongoose.Schema({
    hash: {
        type: String,
        required: true,
        unique: true,
        sparse: true
    }
});

const WorkspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false
    },
    userId: {
        type: String, 
        required: true,
        unique: false
    },
    submissionIds: {
        type: [SubmissionIdSchema],
        required: false,
        unique: false
    },
    sensors: {
        type: [SensorSchema],
        required: true,
        unique: false
    },
    labels: {
        type: [LabelSchema],
        required: false,
        unique: false
    },
    samples: {
        type: [SampleSchema],
        required: false,
        unique: false
    },
    lastModified: {
        type: Date,
        required: true,
        unique: false
    }
});

export default mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);