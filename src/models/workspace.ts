import mongoose from "mongoose"
import { ISensor, SensorSchema } from "./sensor";
import { ILabel, LabelSchema } from "./label";
export interface IWorkspace extends mongoose.Document {
    name: string,
    userId: string,
    submissionIDs: string[],
    sensors: ISensor[],
    labels: ILabel[]
}

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
    submissionIDs: {
        type: [String],
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
    }
});

export default mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);