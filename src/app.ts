import express, { Request, Response, NextFunction } from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import * as workspaceController from "./controllers/workspaceController"

dotenv.config();

mongoose.connect(`mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@${process.env.DATABASE_IP}/${process.env.DATABASE}?retryWrites=true&w=majority`,
        {   
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true 
        });

mongoose.connection.on('error', console.error.bind(console, 'Connection error:'));        
mongoose.connection.once('open', function() {
    console.log("Database connection established");
});

const workspaceIdValidator = (req: Request, res: Response, next : NextFunction) => {
    const workspaceId = req.params.workspaceId as string;
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).send("Invalid workspace id");
    }
    next();
}

const app = express();

app.use(express.json());

process.on('unhandledRejection', (reason, promise) => {
    console.log(reason);
})

app.listen(process.env.PORT, () => {
    console.log("Server started");
});

app.post("/api/workspaces/create", workspaceController.postCreateWorkspace);
app.get("/api/workspaces", workspaceController.getWorkspaces);

app.use("/api/workspaces/:workspaceId", workspaceIdValidator);

app.put("/api/workspaces/:workspaceId", workspaceController.putRenameWorkspace);
app.delete("/api/workspaces/:workspaceId", workspaceController.deleteWorkspace);
app.get("/api/workspaces/:workspaceId/sensors", workspaceController.getWorkspaceSensors);