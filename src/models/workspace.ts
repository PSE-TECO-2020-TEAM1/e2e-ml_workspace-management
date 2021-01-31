import mongoose from "mongoose"

interface IWorkspace extends mongoose.Document {
    id: mongoose.Types.ObjectId,
    name: string,
    user: string,
    submissionIDs: string[]
}

const WorkspaceSchema = new mongoose.Schema({
    id: {
        type: mongoose.Types.ObjectId,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: false
    },
    user: {
        type: String,
        required: true,
        unique: true
    },
    submissionIDs: {
        type: [String],
        required: true,
        unique: false
    }

});

export default mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);