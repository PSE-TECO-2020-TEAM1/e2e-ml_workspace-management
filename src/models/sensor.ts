import mongoose from "mongoose"

export class SensorType {
    static readonly ACCELEROMETER = new SensorType(50, 25, ['x', 'y', 'z']);
    static readonly GYROSCOPE = new SensorType(100, 70, ['x', 'y', 'z']);
    static readonly MAGNETOMETER = new SensorType(250, 250, ['x', 'y', 'z']);

    // private to disallow creating other instances of this type
    private constructor(
        public readonly maxSamplingRate: number,
        public readonly defaultSamplingRate: number,
        public readonly dataFormat: string[]
        ) {}
}

interface ISensor extends mongoose.Document {
    sensorType: SensorType,
    samplingRate: number
}

const SensorSchema = new mongoose.Schema({
    sensorType: {
        type: SensorType,
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