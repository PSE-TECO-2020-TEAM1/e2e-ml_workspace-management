import mongoose from "mongoose";

export interface ILabel extends mongoose.Document {
    name: string,
    description: string,
    workspaceId: string
    sampleCount: number
}

export const LabelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false,
    },
    description: {
        type: String,
        required: false,
        unique: false
    },
    workspaceId: {
        type: String,
        required: true,
        unique: false
    },
    sampleCount: {
        type: Number,
        required: true,
        unique: false
    }
}); 

export default mongoose.model<ILabel>("Label", LabelSchema);