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
    maxSamplingRate: 100,
    defaultSamplingRate: 50,
    dataFormat: ['x','y','z']
} as const

export const GYROSCOPE: SensorType = {
    name: "Gyroscope",
    maxSamplingRate: 100,
    defaultSamplingRate: 50,
    dataFormat: ['x','y','z']
} as const

export const MAGNETOMETER: SensorType = {
    name: "Magnetometer",
    maxSamplingRate: 100,
    defaultSamplingRate: 50,
    dataFormat: ['x','y','z']
} as const

export const SENSOR_TYPES: readonly SensorType[] = [ACCELEROMETER, GYROSCOPE, MAGNETOMETER] as const;
export interface ISensor extends mongoose.Document {
    sensorType: SensorType,
    samplingRate: number
}

export const SensorSchema = new mongoose.Schema({
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

// export default mongoose.model<ISensor>("Sensor", SensorSchema);
