import mongoose from "mongoose"
import { ISensor, SensorTypeSchema } from "./sensor";

interface IWorkspace extends mongoose.Document {
    name: string,
    userId: string,
    submissionIDs: string[],
    sensors: ISensor[]
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
        type: [{
            sensorType: SensorTypeSchema,
            samplingRate: Number
        }],
        required: true,
        unique: false
    }
});

export default mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);