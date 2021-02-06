import mongoose from "mongoose";
import supertest from "supertest";
import chai, { expect } from "chai";
import mocha from "mocha";

const app = require("../src/app.ts");
const request = supertest(app);
let workspaceId: string;
const userId = 32;
const workspaceName = "Test Workspace";

const workspaceInfo = {
	name: "Example Workspace",
	userId: userId,
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

const toBeDeletedWorkspaceInfo = {
	name: "Will Be Deleted",
	userId: userId,
	sensors: [
		{
			sensorName: "Magnetometer",
			samplingRate: 50,
		},
		{
			sensorName: "Accelerometer",
			samplingRate: 64,
		},
	]
};
let toBeDeletedWorkspaceId: string;


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

	// test order? can you create workspace within a test then use this workspace in another test
	// or do you need to do it in before, then how to test creation of workspaces?
	describe("Testing workspaces of a user", () => {
		// IF THE WORKSPACE IS ACTUALLY CREATED CHECKED IN 3rd TEST
		it("Create a workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set('Content-Type', 'application/json')
				.send(workspaceInfo)
				.expect(200)
				.end((err, res) => {
					expect(res.body).to.be.a("string");
					workspaceId = res.body;
					done(err);
				});
		});

		it("Create another workspace that will be deleted", (done) => {
			request
				.post("/api/workspaces/create")
				.set('Content-Type', 'application/json')
				.send(toBeDeletedWorkspaceInfo)
				.expect(200)
				.end((err, res) => {
					expect(res.body).to.be.a("string");
					toBeDeletedWorkspaceId = res.body;
					done(err);
				});
		})
		// THIS ACTUALLY TEST CREATE WORKSPACE TOO, CONCERN?
		it("Retrieve workspaces", (done) => {
			request
				.get("/api/workspaces")
				.query({userId: userId}) // TODO: needs to be changed after auth is implemented
				.expect(200)
				.end((err, res) => {
					expect(res.body).to.have.nested.property("[0].id");
					expect(res.body).to.have.nested.property("[0].name");
					expect(res.body).to.have.nested.property("[1].id");
					expect(res.body).to.have.nested.property("[1].name");
					done(err);
				});
		});

		describe("Testing DELETE /api/workspaces/:workspaceId, try deleting", () => {
			it("An existing workspace", (done) => {
				request
				.delete("/api/workspaces/" + toBeDeletedWorkspaceId)
				.expect(200)
				.end((err, res) => {
					done(err);
				});
			});

			it("A non-existing workspace (deleted in previous test)", (done) => {
				request
				.delete("/api/workspaces/" + toBeDeletedWorkspaceId)
				.expect(400)
				.end((err, res) => {
					expect(res.text).to.equal("Workspace with given id does not exist");
					done(err);
				});
			})
		});

		describe("Testing PUT /api/workspaces/:workspaceId, rename the workspace", () => {
			it("With an invalid name", (done) => {
				request
				.put("/api/workspaces/" + workspaceId)
				.query({workspaceName: ""})
				.expect(400)
				.end((err, res) => {
					expect(res.text).to.be.a("string");
					expect(res.text).to.equal("Workspace name needs to be provided");
					done(err);
				})
			});
			// HOW TO CHAIN REQUESTS TO TEST IF THE NAME CHANGE HAS REALLY OCCURED?
			it("With a valid name", (done) => {
				request
				.put("/api/workspaces/" + workspaceId)
				.query({workspaceName: workspaceName})
				.expect(200)
				.end((err, res) => {
					// request
					// 	.get("/api/workspaces")
					// 	.query({userId: userId}) // TODO: needs to be changed after auth is implemented
					// 	.expect(200)
					// 	.end((err, res) => {
					// 		console.log(res.body);
					// 		expect(res.body).to.have.deep.property("[2].id", workspaceId);
					// 		expect(res.body).to.have.deep.property("[0].name", workspaceName);
					// 		done(err);
					// 	})
					done(err);
				})
			});
		});
	});
});
