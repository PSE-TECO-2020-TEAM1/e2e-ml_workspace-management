import mongoose from "mongoose";
import { ILabel, LabelSchema } from "./label";

export interface IDataPoint extends mongoose.Document {
    timestamp: number,
    data: number[]
}

const DataPointSchema = new mongoose.Schema({
    timestamp: {
        type: Number,
        required: true,
        unique: false
    },
    data: {
        type: [Number],
        required: true,
        unique: false
    }
}, { _id: false });

export interface ITimeFrame {
    start: number,
    end: number
}

const TimeFrameSchema = new mongoose.Schema({
    start: {
        type: Number,
        required: true,
        unique: false
    },
    end: {
        type: Number,
        required: true,
        unique: false
    }
}, { _id: false});

export interface ISensorDataPoints extends mongoose.Document {
    sensorId: string // ObjectId maybe?
    dataPoints: IDataPoint[]
}

const SensorDataPointsSchema = new mongoose.Schema({
    sensorId: {
        type: String,
        required: true,
        unique: false
    },
    dataPoints: {
        type: [DataPointSchema],
        required: true,
        unique: false
    },
}, { _id: false });

export interface ISample extends mongoose.Document {
    start: number,
    end: number,
    labelId: string,
    allSensorDataPoints: ISensorDataPoints[],
    timeFrames: ITimeFrame[]
}

export const SampleSchema = new mongoose.Schema({
    start: {
        type: Number,
        required: true,
        unique: false
    },
    end: {
        type: Number,
        required: true,
        unique: false
    },
    labelId: {
        type: String,
        required: true,
        unique: false
    },
    allSensorDataPoints: {
        type: [SensorDataPointsSchema],
        required: true,
        unique: false
    },
    timeFrames: {
        type: [TimeFrameSchema],
        required: true, // ????
        unique: false
    }
});

export default mongoose.model("Sample", SampleSchema);
