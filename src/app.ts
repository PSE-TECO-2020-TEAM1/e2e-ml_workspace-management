import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
dotenv.config();

mongoose.connect(process.env.DATABASE_CONNECTION,
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
const router = require("./routers/router");
app.use(express.json());

process.on('unhandledRejection', (reason, promise) => {
    console.log(reason);
})

const server = app.listen(process.env.PORT, () => {
    console.log("Server started");
});

app.use("/api", router);

module.exports = server;