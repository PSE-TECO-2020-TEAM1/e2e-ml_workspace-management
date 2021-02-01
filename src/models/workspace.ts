import mongoose from "mongoose"
import { SensorType, SensorTypeSchema } from "./sensor";

interface IWorkspace extends mongoose.Document {
    name: string,
    userId: number,
    submissionIDs: string[],
    sensors: {
        sensorType: SensorType,
        samplingRate: number
    }[]
}

const WorkspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false
    },
    userId: {
        type: Number, 
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