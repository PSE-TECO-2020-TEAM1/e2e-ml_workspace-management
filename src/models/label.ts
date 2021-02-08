import mongoose from "mongoose";

export interface ILabel extends mongoose.Document {
    name: string,
    description: string
}

// name unique doesnt work across workspaces of different users
export const LabelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        sparse: true
    },
    description: {
        type: String,
        required: false,
        unique: false,
        sparse: true
    }
}); 

export default mongoose.model<ILabel>("Label", LabelSchema);