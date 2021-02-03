import { expect } from "chai"
import mongoose from "mongoose"
import supertest from "supertest"

const app = require("../src/app.ts")
const request = supertest(app);

const workspace1 = {
    name: "Workspace 1",
    sensors: [
        {
            sensorName: "Gyroscope",
            samplingRate: 50
        }
    ]
}

const workspace2 = {
    name: "Workspace 2",
    sensors: [
        {
            sensorName: "Gyroscope",
            samplingRate: 50
        },
        {
            sensorName: "Accelerometer",
            samplingRate: 64
        }
    ]
}


describe('Testing API Endpoints', () => {
    before('Check connection', (done) => {
		mongoose.connection.on('connected', () => {
			done();
		});
    });
    
    before('Drop collections', (done) => {
		mongoose.connection.db.dropDatabase();
		done();
    });
    

    describe('Get workspaces', () => {
        it('Returns workspaces', (done) => {
            request.get("/api/workspaces").expect(200).end((err, res) => {
                expect(res.body).to.be.an("array");
                done();
            });
        });
    });

    // describe('Create a new workspace'), () => {
    //     it('Created workspace1', (done) => {
    //         request.post("/api/workspaces/create").send(workspace1).expect(200).end((err, res) => {
    //             expect(res.body).to.be.a("string");
    //             done();
    //         });
    //     });
    // }
});