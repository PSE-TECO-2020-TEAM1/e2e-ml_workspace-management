import mongoose from "mongoose"

export interface SensorType {
    name: string,
    maxSamplingRate: number,
    defaultSamplingRate: number,
    dataFormat: readonly string[]
};

export const SensorTypeSchema: Record<keyof SensorType, any> = {
    name: {
        type: String,
        required: true,
        unique: false
    },
    maxSamplingRate: {
        type: Number,
        required: true,
        unique: false
    },
    defaultSamplingRate: {
        type: Number,
        required: true,
        unique: false
    },
    dataFormat: {
        type: [String],
        required: true,
        unique: false
    }
}

export const ACCELEROMETER: SensorType = {
    name: "Accelerometer",
    maxSamplingRate: 50,
    defaultSamplingRate: 25,
    dataFormat: ['x','y','z']
} as const

export const GYROSCOPE: SensorType = {
    name: "Gyroscope",
    maxSamplingRate: 100,
    defaultSamplingRate: 70,
    dataFormat: ['x','y','z']
} as const

export const MAGNETOMETER: SensorType = {
    name: "Magnetometer",
    maxSamplingRate: 250,
    defaultSamplingRate: 250,
    dataFormat: ['x','y','z']
} as const
export interface ISensor extends mongoose.Document {
    sensorType: SensorType,
    samplingRate: number
}

const SensorSchema = new mongoose.Schema({
    sensorType: {
        type: SensorTypeSchema,
        required: true,
        unique: false
    },
    samplingRate: {
        type: Number,
        required: true,
        unique: false
    }
});

export default mongoose.model<ISensor>("Sensor", SensorSchema);