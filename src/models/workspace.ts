import mongoose from "mongoose"
import { SensorType } from "./sensor";

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
        unique: true
    },
    submissionIDs: {
        type: [String],
        required: false,
        unique: false
    },
    sensors: {
        type: [{
            sensorType: SensorType,
            samplingRate: Number
        }],
        required: true,
        unique: false
    }
});

export default mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);