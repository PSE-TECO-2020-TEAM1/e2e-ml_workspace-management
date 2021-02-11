import mongoose from "mongoose";
import supertest from "supertest";
import chai, { expect } from "chai";

const app = require("../src/app.ts");
const request = supertest(app);
const userId = 32;
const token =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMiIsImlhdCI6MTYxMjg3NTc3NiwiZXhwIjoxNjQ0NDExNzc2fQ.K7xmiAYHY-NsK_Nn0RAEzxb4dIbX7dCi5p2m068jI_8";

const validWorkspace = {
	name: "Example Workspace",
	userId: userId, // to be deleted
	sensors: [
		{
			sensorName: "Gyroscope",
			samplingRate: 50,
		},
		{
			sensorName: "Accelerometer",
			samplingRate: 64,
		},
	]
};

const duplicateSensorWorkspace = {
	name: "Duplicate Sensors Workspace",
	userId: userId, // to be deleted
	sensors: [
		{
			sensorName: "Gyroscope",
			samplingRate: 50,
		},
		{
			sensorName: "Gyroscope",
			samplingRate: 64,
		},
	]
}

const unsupportedSensorWorkspace = {
	name: "Unsupported Sensor Workspace",
	userId: userId, // to be deleted
	sensors: [
		{
			sensorName: "Unsupported",
			samplingRate: 50,
		},
		{
			sensorName: "Gyroscope",
			samplingRate: 64,
		},
	]
}

const invalidSensorSamplingRateWorkspace = {
	name: "Invalid Sensor Sampling Rate Workspace",
	userId: userId, // to be deleted
	sensors: [
		{
			sensorName: "Accelerometer",
			samplingRate: 50000,
		},
		{
			sensorName: "Gyroscope",
			samplingRate: -40,
		},
	]
}

describe("Testing API routes", () => {
	before("Check connection", (done) => {
		mongoose.connection.on("connected", () => {
			done();
		});
	});

	before("Drop collections", (done) => {
		mongoose.connection.db.dropDatabase();
		done();
	});

	describe("GET /api/workspaces", () => {
		it("Without authentication", (done) => {
			request.get("/api/workspaces").expect(401, done);
		});

		it("With authentication", (done) => {
			request
				.get("/api/workspaces")
				.set("Authorization", "Bearer " + token)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.an("array");
					done();
				})
				.catch((err) => {
					done(err);
				});
		});
	});

	describe("POST /api/workspaces/create", () => {
		it("Without authentication", (done) => {
			request.post("/api/workspaces/create").expect(401, done);
		});

		describe("With authentication", () => {
			it("Valid workspace information", (done) => {
				request
				.post("/api/workspaces/create")
				.set('Content-Type', 'application/json')
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					done();
				})
				.catch((err) => {
					done(err);
				});
			});

			it("Duplicate sensors", (done) => {
				request
				.post("/api/workspaces/create")
				.set('Content-Type', 'application/json')
				.set("Authorization", "Bearer " + token)
				.send(duplicateSensorWorkspace)
				.expect(400)
				.then((res) => {
					expect(res.text).to.be.a("string");
					expect(res.text).to.be.equal("Cannot create workspace with duplicate sensors");
					done();
				})
				.catch((err) => {
					done(err);
				});
			});

			it("Unsupported sensors", (done) => {
				request
				.post("/api/workspaces/create")
				.set('Content-Type', 'application/json')
				.set("Authorization", "Bearer " + token)
				.send(unsupportedSensorWorkspace)
				.expect(400)
				.then((res) => {
					expect(res.text).to.be.a("string");
					expect(res.text).to.be.equal("Invalid sensor type");
					done();
				})
				.catch((err) => {
					done(err);
				});
			});
			

			it("Invalid sensor sampling rate", (done) => {
				request
				.post("/api/workspaces/create")
				.set('Content-Type', 'application/json')
				.set("Authorization", "Bearer " + token)
				.send(invalidSensorSamplingRateWorkspace)
				.expect(400)
				.then((res) => {
					expect(res.text).to.be.a("string");
					expect(res.text).to.be.equal("Invalid sensor sampling rate");
					done();
				})
				.catch((err) => {
					done(err);
				});
			})

			it("Invalid request", (done) => {
				request
					.post("/api/workspaces/create")
					.set('Content-Type', 'application/json')
					.set("Authorization", "Bearer " + token)
					.send({ invalid: "invalid" })
					.expect(400, done);
			})
		});

	})
});
