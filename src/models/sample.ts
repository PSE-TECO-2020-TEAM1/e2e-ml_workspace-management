import mongoose from "mongoose";
import { ILabel, LabelSchema } from "./label";

interface IDataPoint extends mongoose.Document {
    value: number[],
    timestamp: number
}

const DataPointSchema = new mongoose.Schema({
    value: {
        type: [Number],
        required: true,
        unique: false
    },
    timestamp: {
        type: Number,
        required: true,
        unique: false
    }
});

interface ITimeFrame {
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
});

interface ISensorDataPoints extends mongoose.Document {
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
});

export interface ISample extends mongoose.Document {
    start: number,
    end: number,
    label: ILabel,
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
    label: {
        type: LabelSchema,
        required: true,
        unique: false
    },
    allSensorDataPoints: {
        type: [TimeFrameSchema],
        required: true,
        unique: false
    }
});

