import express from "express"
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

const app = express();

app.use(express.json());

app.listen(process.env.PORT, () => {
    console.log("Server started");
});

app.post("/api/workspaces/create", workspaceController.postCreateWorkspace);