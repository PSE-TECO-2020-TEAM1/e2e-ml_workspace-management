import mongoose from "mongoose";
import supertest from "supertest";
import { expect } from "chai";

const app = require("../src/app.ts");
const request = supertest(app);
const userId = 32;
const token =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMiIsImlhdCI6MTYxMjg3NTc3NiwiZXhwIjoxNjQ0NDExNzc2fQ.K7xmiAYHY-NsK_Nn0RAEzxb4dIbX7dCi5p2m068jI_8";

const nonExistingWorkspaceId = "000000000000000000000000";
let renamedWorkspaceId: string;
let deletedWorkspaceId: string;
let sensorsWorkspaceId: string;
let generateSubmissionIdWorkspaceId: string;

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
			samplingRate: 25,
		},
	],
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
			samplingRate: 25,
		},
	],
};

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
			samplingRate: 25,
		},
	],
};

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
	],
};

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

		it("Valid workspace information", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
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
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(duplicateSensorWorkspace)
				.expect(400)
				.then((res) => {
					expect(res.text).to.be.a("string");
					expect(res.text).to.be.equal(
						"Cannot create workspace with duplicate sensors"
					);
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Unsupported sensors", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
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
				.set("Content-Type", "application/json")
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
		});

		it("Invalid request", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send({ invalid: "invalid" })
				.expect(400, done);
		});
	});

	describe("PUT /api/workspaces/:workspaceId", () => {
		before("Create a workspace to rename", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					renamedWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Rename without authentication", (done) => {
			request.put("/api/workspaces/" + renamedWorkspaceId).expect(401, done);
		});

		it("Rename a non-existing workspace", (done) => {
			request
				.put("/api/workspaces/" + nonExistingWorkspaceId)
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.query({ workspaceName: "Renamed Workspace" })
				.expect(400, done);
		});

		it("Rename without a name", (done) => {
			request
				.put("/api/workspaces/" + renamedWorkspaceId)
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.query({ workspaceName: "" })
				.expect(400, done);
		});

		it("Rename successfully", (done) => {
			request
				.put("/api/workspaces/" + renamedWorkspaceId)
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.query({ workspaceName: "Renamed Workspace" })
				.expect(200, done);
		});
	});

	describe("DELETE /api/workspaces/:workspaceId", () => {
		before("Create a workspace to delete", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					deletedWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Delete without authentication", (done) => {
			request.delete("/api/workspaces/" + deletedWorkspaceId).expect(401, done);
		});

		it("Delete a non-existing workspace", (done) => {
			request
				.delete("/api/workspaces/" + nonExistingWorkspaceId)
				.set("Authorization", "Bearer " + token)
				.expect(400, done);
		});

		it("Delete successfully", (done) => {
			request
				.delete("/api/workspaces/" + deletedWorkspaceId)
				.set("Authorization", "Bearer " + token)
				.expect(200, done);
		});
	});

	describe("GET /api/workspaces/:workspaceId/sensors", () => {
		before("Create a workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					sensorsWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Retrieve sensors without authentication", (done) => {
			request
				.get("/api/workspaces/" + sensorsWorkspaceId + "/sensors")
				.expect(401, done);
		});

		it("Retrieve sensors of a non-existing workspace", (done) => {
			request
				.get("/api/workspaces/" + nonExistingWorkspaceId + "/sensors")
				.set("Authorization", "Bearer " + token)
				.expect(400, done);
		});

		it("Retrieve sensors successfully", (done) => {
			request
				.get("/api/workspaces/" + sensorsWorkspaceId + "/sensors")
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

	describe("GET /api/workspaces/:workspaceId/generateSubmissionId", () => {
		before("Create a workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					generateSubmissionIdWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Generate submission id without authentication", (done) => {
			request
				.get(
					"/api/workspaces/" +
						generateSubmissionIdWorkspaceId +
						"/generateSubmissionId"
				)
				.expect(401, done);
		});

		it("Generate submision id for a non-existing workspace", (done) => {
			request
				.get(
					"/api/workspaces/" + nonExistingWorkspaceId + "/generateSubmissionId"
				)
				.set("Authorization", "Bearer " + token)
				.expect(400, done);
		});

		it("Generate submision id successfully", (done) => {
			request
				.get(
					"/api/workspaces/" +
						generateSubmissionIdWorkspaceId +
						"/generateSubmissionId"
				)
				.set("Authorization", "Bearer " + token)
				.expect(200)
				.then((res) => {
					expect(res.text).to.be.a("string").of.length(32);
					done();
				})
				.catch((err) => {
					done(err);
				});
		});
	});
});
