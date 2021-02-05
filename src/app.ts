import express, { Request, Response, NextFunction } from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import * as workspaceController from "./controllers/workspaceController"
import * as labelController from "./controllers/labelController";
import * as sampleController from "./controllers/sampleController";
import { workspaceIdValidator } from "./middlewares/workspaceIdValidator";
import { workspaceFinder } from "./middlewares/workspaceFinder";
import { labelIdValidator } from "./middlewares/labelIdValidator";
import { labelFinder } from "./middlewares/labelFinder";
import { sampleIdValidator } from "./middlewares/sampleValidator";
import { sampleFinder } from "./middlewares/sampleFinder";


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
    // remove after development
    // mongoose.connection.db.dropDatabase();
});

const app = express();

app.use(express.json());

process.on('unhandledRejection', (reason, promise) => {
    console.log(reason);
})

const server = app.listen(process.env.PORT, () => {
    console.log("Server started");
});

app.post("/api/workspaces/create", workspaceController.postCreateWorkspace);
app.get("/api/workspaces", workspaceController.getWorkspaces);

app.use("/api/workspaces/:workspaceId", workspaceIdValidator);
app.use("/api/workspaces/:workspaceId", workspaceFinder);

app.put("/api/workspaces/:workspaceId", workspaceController.putRenameWorkspace);
app.delete("/api/workspaces/:workspaceId", workspaceController.deleteWorkspace);
app.get("/api/workspaces/:workspaceId/sensors", workspaceController.getWorkspaceSensors);
app.get("/api/workspaces/:workspaceId/labels", labelController.getLabels);
app.post("/api/workspaces/:workspaceId/labels/create", labelController.postCreateLabel);
app.get("/api/workspaces/:workspaceId/generateSubmissionId", workspaceController.getGenerateSubmissionId);
app.get("/api/workspaces/:workspaceId/samples", sampleController.getSamples);

app.use("/api/workspaces/:workspaceId/labels/:labelId", labelIdValidator);
app.use("/api/workspaces/:workspaceId/labels/:labelId", labelFinder);

app.put("/api/workspaces/:workspaceId/labels/:labelId/rename", labelController.putRenameLabel);
app.put("/api/workspaces/:workspaceId/labels/:labelId/describe", labelController.putDescribeLabel);
app.delete("/api/workspaces/:workspaceId/labels/:labelId", labelController.deleteLabel);
app.post("/api/submitSample", sampleController.postSubmitSample);

app.use("/api/workspaces/:workspaceId/samples/:sampleId", sampleIdValidator);
app.use("/api/workspaces/:workspaceId/samples/:sampleId", sampleFinder);

app.get("/api/workspaces/:workspaceId/samples/:sampleId", sampleController.getSample);
app.delete("/api/workspaces/:workspaceId/samples/:sampleId", sampleController.deleteSample);
app.put("/api/workspaces/:workspaceId/samples/:sampleId/relabel", sampleController.putRelabelSample);
app.put("/api/workspaces/:workspaceId/samples/:sampleId/timeframes", sampleController.putChangeTimeFrames);

app.get("/api/submissionConfig", workspaceController.getSubmissionConfig);

module.exports = server;