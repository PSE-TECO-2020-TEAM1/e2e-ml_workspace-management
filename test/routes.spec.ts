import mongoose from "mongoose";
import supertest from "supertest";
import chai, { expect } from "chai";

const app = require("../src/app.ts");
const request = supertest(app);
chai.use(require("chai-like"));
chai.use(require("chai-things"));

const userId = 32;
const token =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzMiIsImlhdCI6MTYxMjg3NTc3NiwiZXhwIjoxNjQ0NDExNzc2fQ.K7xmiAYHY-NsK_Nn0RAEzxb4dIbX7dCi5p2m068jI_8";

const nonExistingWorkspaceId = "000000000000000000000000";
const nonExistingLabelId = "000000000000000000000001";
const nonExistingSampleId = "000000000000000000000002"
const nonExistingSubmissionId = "00000000000000000000000000000003";

const invalidWorkspaceId = "a";
const invalidLabelId = "b";
const invalidSampleId = "c";

let workspaceId: string;
let renamedWorkspaceId: string;
let deletedWorkspaceId: string;
let sensorsWorkspaceId: string;
let labelsWorkspaceId: string;
let labelsOtherWorkspaceId: string;
let labelsWorkspaceSubmissionId: string;
let generateSubmissionIdWorkspaceId: string;
let submissionId: string;
let labelId: string;
let otherLabelId: string;

let otherWorkspaceLabelId: string;
let samplesWorkspaceId: string;
let samplesOtherWorkspaceId: string;
let samplesWorkspaceSubmissionId: string;
let samplesOtherWorkspaceSubmissionId: string;

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

const label = {
	name: "Throw",
	workspaceId: nonExistingWorkspaceId,
};

const otherLabel = {
	name: "Shake",
	workspaceId: nonExistingWorkspaceId,
};

const renamedLabelName = "Renamed";
const labelDescription = "Description";

let sampleId: string;
let otherSampleId: string;
let labelDeleteSampleId: string;
let sensorName = "Gyroscope";

const sample = {
	submissionId: "",
	label: label.name,
	start: 1609945761,
	end: 1609945852,
	sensorDataPoints: [
		{
			sensor: sensorName,
			dataPoints: [
				{
					timestamp: 1609945761,
					data: [24, 12, 113],
				},
				{
					timestamp: 1609945762,
					data: [24, 12, 123],
				},
			]
		}
	]
};

const otherSample = {
	submissionId: "",
	label: label.name,
	start: 1609945761,
	end: 1609945852,
	sensorDataPoints: [
		{
			sensor: sensorName,
			dataPoints: [
				{
					timestamp: 1609945761,
					data: [24, 12, 113],
				},
				{
					timestamp: 1609945762,
					data: [24, 12, 123],
				},
			]
		}
	]
};

const labelDeleteSample = {
	submissionId: "",
	label: label.name,
	start: 1609945761,
	end: 1609945852,
	sensorDataPoints: [
		{
			sensor: sensorName,
			dataPoints: [
				{
					timestamp: 1609945761,
					data: [24, 12, 113],
				},
				{
					timestamp: 1609945762,
					data: [24, 12, 123],
				},
			]
		}
	]
};

const sampleNonExistingSubmissionId =  {
	submissionId: nonExistingSubmissionId,
	label: label.name,
	start: 1609945761,
	end: 1609945852,
	sensorDataPoints: [
		{
			sensor: sensorName,
			dataPoints: [
				{
					timestamp: 1609945761,
					data: [24, 12, 113],
				},
				{
					timestamp: 1609945762,
					data: [24, 12, 123],
				},
			]
		}
	]
};

const sampleNonExistingLabel = {
	submissionId: "",
	label: "doesnt exist",
	start: 1609945761,
	end: 1609945852,
	sensorDataPoints: [
		{
			sensor: sensorName,
			dataPoints: [
				{
					timestamp: 1609945761,
					data: [24, 12, 113],
				},
				{
					timestamp: 1609945762,
					data: [24, 12, 123],
				},
			]
		}
	]
};

const sampleStartTimeLaterThanEnd = {
	submissionId: "",
	label: label.name,
	start: 1659945761,
	end: 1609945852,
	sensorDataPoints: [
		{
			sensor: sensorName,
			dataPoints: [
				{
					timestamp: 1609945761,
					data: [24, 12, 113],
				},
				{
					timestamp: 1609945762,
					data: [24, 12, 123],
				},
			]
		}
	]
};

const sampleNonExistingSensor = {
	submissionId: "",
	label: label.name,
	start: 1609945761,
	end: 1609945852,
	sensorDataPoints: [
		{
			sensor: "AmbientLightSensor",
			dataPoints: [
				{
					timestamp: 1609945761,
					data: [24, 12, 113],
				},
				{
					timestamp: 1609945762,
					data: [24, 12, 123],
				},
			]
		}
	]
};

const sampleWrongDataFormat = {
	submissionId: "",
	label: label.name,
	start: 1609945761,
	end: 1609945852,
	sensorDataPoints: [
		{
			sensor: sensorName,
			dataPoints: [
				{
					timestamp: 1609945761,
					data: [24, 12, 113, 312],
				},
				{
					timestamp: 1609945762,
					data: [24, 12, 123],
				},
			]
		}
	]
};

const validTimeframes = [
	{
		start: 1609945761,
		end: 1609945762
	},
	{
		start: 1609945763,
		end: 1609945765
	},
	{
		start: 1609945771,
		end: 1609945782
	}
]

const timeframeStartLaterThanEnd = [
	{
		start: 1609945762,
		end: 1609945761
	}
]

const timeframesNotSorted = [
	{
		start: 1609945763,
		end: 1609945765
	},
	{
		start: 1609945771,
		end: 1609945782
	},
	{
		start: 1609945761,
		end: 1609945762
	}
]

const timeframesIntersecting = [
	{
		start: 1609945761,
		end: 1609945762
	},
	{
		start: 1609945762,
		end: 1609945790
	},
	{
		start: 1609945771,
		end: 1609945782
	}
]

const timeframeNotBetweenSampleStartEnd = [
	{
		start: sample.start - 1,
		end: sample.end + 1
	}
]

const samplesReturn = {
	label: label.name,
	sensorDataPoints: [
		{
			dataPoints: [
				{
					timestamp: 1609945761,
					data: [24, 12, 113],
				},
				{
					timestamp: 1609945762,
					data: [24, 12, 123],
				}
			]
		}
	],
	timeFrames: [
		{
			start: sample.start,
			end: sample.end,
		}
	]
};

const singleSampleReturn = {
	label: label.name,
	start: sample.start,
	end: sample.end,
	sensorDataPoints: [
		{
			dataPoints: [
				{
					timestamp: 1609945761,
					data: [24, 12, 113],
				},
				{
					timestamp: 1609945762,
					data: [24, 12, 123],
				}
			]
		}
	],
	timeFrames: [
		{
			start: sample.start,
			end: sample.end,
		}
	]
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
		before("Create a workspace", (done) => {
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

		it("Rename a workspace with an invalid id", (done) => {
			request
				.put("/api/workspaces/" + invalidWorkspaceId)
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.query({ workspaceName: "Renamed Workspace" })
				.expect(400)
				.then((res) => {
					expect(res.text).to.be.equal("Invalid workspace id");
					done();
				})
				.catch((err) => {
					done(err);
				})
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

	describe("GET /api/submissionConfig", () => {
		// TODO: add labels
		before("Create a workspace and generate a submission id for it", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					workspaceId = res.body;
					return request
						.get("/api/workspaces/" + workspaceId + "/generateSubmissionId")
						.set("Authorization", "Bearer " + token)
						.expect(200)
						.then((res) => {
							submissionId = res.text;
							done();
						})
						.catch((err) => {
							done(err);
						});
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create a label for the workspace", (done) => {
			request
				.post("/api/workspaces/" + workspaceId + "/labels/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(label)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Retrieve submission config with a non-matching submission id", (done) => {
			request
				.get("/api/submissionConfig")
				.query({ submissionId: nonExistingSubmissionId })
				.expect(400, done);
		});

		it("Retrieve submission config successfully", (done) => {
			request
				.get("/api/submissionConfig")
				.query({ submissionId: submissionId })
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.an("object");
					done();
				})
				.catch((err) => {
					done(err);
				});
		});
	});

	describe("GET /api/workspaces/:workspaceId/labels", () => {
		before("Create a workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelsWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Retrieve labels without authentication", (done) => {
			request
				.get("/api/workspaces/" + labelsWorkspaceId + "/labels")
				.expect(401, done);
		});

		it("Retrieve labels of a non-existing workspace", (done) => {
			request
				.get("/api/workspaces/" + nonExistingWorkspaceId + "/labels")
				.set("Authorization", "Bearer " + token)
				.expect(400, done);
		});

		it("Retrieve labels successfully", (done) => {
			request
				.get("/api/workspaces/" + labelsWorkspaceId + "/labels")
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

	describe("POST /api/workspaces/:workspaceId/labels/create", () => {
		before("Create a workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelsWorkspaceId = res.body;
					label.workspaceId = labelsWorkspaceId;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create another workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelsOtherWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		beforeEach("Clear labels", async () => {
			const l = (
				await mongoose.connection.db
					.listCollections({ name: "labels" })
					.toArray()
			).length;
			if (l) {
				mongoose.connection.dropCollection("labels");
			}
		});

		after("Clear labels", async () => {
			const l = (
				await mongoose.connection.db
					.listCollections({ name: "labels" })
					.toArray()
			).length;
			if (l) {
				mongoose.connection.dropCollection("labels");
			}
		});

		it("Without authentication", (done) => {
			request
				.post("/api/workspaces/" + labelsWorkspaceId + "/labels/create")
				.set("Content-Type", "application/json")
				.send(label)
				.expect(401, done);
		});

		it("Create a new label for a non-existing workspace", (done) => {
			request
				.post("/api/workspaces/" + nonExistingWorkspaceId + "/labels/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(label)
				.expect(400, done);
		});

		it("Create a new label with an already existing name", (done) => {
			request
				.post("/api/workspaces/" + labelsWorkspaceId + "/labels/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(label)
				.expect(200)
				.then((res) => {
					return request
						.post("/api/workspaces/" + labelsWorkspaceId + "/labels/create")
						.set("Content-Type", "application/json")
						.set("Authorization", "Bearer " + token)
						.send(label)
						.expect(400)
						.then((res) => {
							expect(res.text)
								.to.be.a("string")
								.that.equals("Label already exists");
							done();
						})
						.catch((err) => {
							done(err);
						});
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Create a new label with the same name but in a different workspace", (done) => {
			request
				.post("/api/workspaces/" + labelsWorkspaceId + "/labels/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(label)
				.expect(200)
				.then((res) => {
					return request
						.post(
							"/api/workspaces/" + labelsOtherWorkspaceId + "/labels/create"
						)
						.set("Content-Type", "application/json")
						.set("Authorization", "Bearer " + token)
						.send(label)
						.expect(200)
						.then((res) => {
							done();
						})
						.catch((err) => {
							done(err);
						});
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Create a new label successfully", (done) => {
			request
				.post("/api/workspaces/" + labelsWorkspaceId + "/labels/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(label)
				.expect(200, done);
		});
	});

	describe("PUT /api/workspaces/:workspaceId/labels/:labelId/rename", () => {
		before("Create a workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelsWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create another workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelsOtherWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create a label for the workspace", (done) => {
			request
				.post("/api/workspaces/" + labelsWorkspaceId + "/labels/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(label)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Rename label without authentication", (done) => {
			request
				.put(
					"/api/workspaces/" +
						labelsWorkspaceId +
						"/labels/" +
						labelId +
						"/rename"
				)
				.query({ labelName: renamedLabelName })
				.expect(401, done);
		});

		it("Rename label of a non-existing workspace", (done) => {
			request
				.put(
					"/api/workspaces/" +
						nonExistingWorkspaceId +
						"/labels/" +
						labelId +
						"/rename"
				)
				.set("Authorization", "Bearer " + token)
				.query({ labelName: renamedLabelName })
				.expect(400)
				.then((res) => {
					expect(res.text)
						.to.be.a("string")
						.that.equals("Workspace with given id does not exist");
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Rename a non-existing label", (done) => {
			request
				.put(
					"/api/workspaces/" +
						labelsWorkspaceId +
						"/labels/" +
						nonExistingLabelId +
						"/rename"
				)
				.set("Authorization", "Bearer " + token)
				.query({ labelName: renamedLabelName })
				.expect(400)
				.then((res) => {
					expect(res.text)
						.to.be.a("string")
						.that.equals("Label with given id does not exist");
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Rename a label with an invalid id", (done) => {
			request
				.put(
					"/api/workspaces/" +
						labelsWorkspaceId +
						"/labels/" +
						invalidLabelId +
						"/rename"
				)
				.set("Authorization", "Bearer " + token)
				.query({ labelName: renamedLabelName })
				.expect(400)
				.then((res) => {
					expect(res.text)
						.to.be.a("string")
						.that.equals("Invalid label id");
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Rename a label that doesn't belong to the workspace", (done) => {
			request
				.put(
					"/api/workspaces/" +
						labelsOtherWorkspaceId +
						"/labels/" +
						labelId +
						"/rename"
				)
				.set("Authorization", "Bearer " + token)
				.query({ labelName: renamedLabelName })
				.expect(400)
				.then((res) => {
					expect(res.text)
						.to.be.a("string")
						.that.equals(
							"Label with given id does not belong to the workspace"
						);
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Rename label without name", (done) => {
			request
				.put(
					"/api/workspaces/" +
						labelsWorkspaceId +
						"/labels/" +
						labelId +
						"/rename"
				)
				.set("Authorization", "Bearer " + token)
				.query({ labelName: "" })
				.expect(400)
				.then((res) => {
					expect(res.text).to.be.equal("Name is invalid");
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Rename successfully", (done) => {
			request
				.put(
					"/api/workspaces/" +
						labelsWorkspaceId +
						"/labels/" +
						labelId +
						"/rename"
				)
				.set("Authorization", "Bearer " + token)
				.query({ labelName: renamedLabelName })
				.expect(200, done);
		});
	});

	describe("PUT /api/workspaces/:workspaceId/labels/:labelId/describe", () => {
		before("Create a workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelsWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create another workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelsOtherWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create a label for the workspace", (done) => {
			request
				.post("/api/workspaces/" + labelsWorkspaceId + "/labels/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(label)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Describe label without authentication", (done) => {
			request
				.put(
					"/api/workspaces/" +
						labelsWorkspaceId +
						"/labels/" +
						labelId +
						"/describe"
				)
				.query({ description: labelDescription })
				.expect(401, done);
		});

		it("Describe label of a non-existing workspace", (done) => {
			request
				.put(
					"/api/workspaces/" +
						nonExistingWorkspaceId +
						"/labels/" +
						labelId +
						"/describe"
				)
				.set("Authorization", "Bearer " + token)
				.query({ description: labelDescription })
				.expect(400)
				.then((res) => {
					expect(res.text)
						.to.be.a("string")
						.that.equals("Workspace with given id does not exist");
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Describe a non-existing label", (done) => {
			request
				.put(
					"/api/workspaces/" +
						labelsWorkspaceId +
						"/labels/" +
						nonExistingLabelId +
						"/describe"
				)
				.set("Authorization", "Bearer " + token)
				.query({ description: labelDescription })
				.expect(400)
				.then((res) => {
					expect(res.text)
						.to.be.a("string")
						.that.equals("Label with given id does not exist");
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Describe a label that doesn't belong to the workspace", (done) => {
			request
				.put(
					"/api/workspaces/" +
						labelsOtherWorkspaceId +
						"/labels/" +
						labelId +
						"/describe"
				)
				.set("Authorization", "Bearer " + token)
				.query({ description: labelDescription })
				.expect(400)
				.then((res) => {
					expect(res.text)
						.to.be.a("string")
						.that.equals(
							"Label with given id does not belong to the workspace"
						);
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Describe label without description", (done) => {
			request
				.put(
					"/api/workspaces/" +
						labelsWorkspaceId +
						"/labels/" +
						labelId +
						"/describe"
				)
				.set("Authorization", "Bearer " + token)
				.query({ description: "" })
				.expect(400)
				.then((res) => {
					expect(res.text).to.be.equal("Description is invalid");
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Describe successfully", (done) => {
			request
				.put(
					"/api/workspaces/" +
						labelsWorkspaceId +
						"/labels/" +
						labelId +
						"/describe"
				)
				.set("Authorization", "Bearer " + token)
				.query({ description: labelDescription })
				.expect(200, done);
		});
	});

	describe("GET /api/workspaces/:workspaceId/labels", () => {
		before("Create a workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelsWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create another workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelsOtherWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create a label for the workspace", (done) => {
			request
				.post("/api/workspaces/" + labelsWorkspaceId + "/labels/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(label)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Without authentication", (done) => {
			request
				.get("/api/workspaces/" + labelsWorkspaceId + "/labels")
				.expect(401, done);
		});

		it("Retrieve labels of a non-existing workspace", (done) => {
			request
				.get("/api/workspaces/" + nonExistingWorkspaceId + "/labels")
				.set("Authorization", "Bearer " + token)
				.expect(400, done);
		});

		it("Retrieve labels of a workspace successfully", (done) => {
			request
				.get("/api/workspaces/" + labelsWorkspaceId + "/labels")
				.set("Authorization", "Bearer " + token)
				.expect(200)
				.end((err, res) => {
					expect(res.body).to.be.an("array").that.contains.something.like({
						name: label.name,
						labelId: labelId,
						sampleCount: 0,
					});
					done(err);
				});
		});
	});

	describe("DELETE /api/workspaces/:workspaceId/labels/:labelId", () => {
		before("Create a workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelsWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Generate submission id for the workspace", (done) => {
			request
				.get("/api/workspaces/" + labelsWorkspaceId + "/generateSubmissionId")
				.set("Authorization", "Bearer " + token)
				.expect(200)
				.then((res) => {
					expect(res.text).to.be.a("string");
					labelsWorkspaceSubmissionId = res.text;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create another workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelsOtherWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create a label for the workspace", (done) => {
			request
				.post("/api/workspaces/" + labelsWorkspaceId + "/labels/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(label)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create a sample for the workspace", (done) => {
			labelDeleteSample.submissionId = labelsWorkspaceSubmissionId;
			request
				.post("/api/submitSample")
				.set("Content-Type", "application/json")
				.send(labelDeleteSample)
				.expect(200)
				.then((res) => {
					// console.log(res);
					expect(res.body).to.be.a("string");
					labelDeleteSampleId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it("Delete label without authentication", (done) => {
			request
				.delete("/api/workspaces/" + labelsWorkspaceId + "/labels/" + labelId)
				.expect(401, done);
		});

		it("Delete non-existing label", (done) => {
			request
				.delete(
					"/api/workspaces/" +
						labelsWorkspaceId +
						"/labels/" +
						nonExistingLabelId
				)
				.set("Authorization", "Bearer " + token)
				.expect(400, done);
		});

		it("Delete label of a non-existing workspace", (done) => {
			request
				.delete(
					"/api/workspaces/" + nonExistingWorkspaceId + "/labels/" + labelId
				)
				.set("Authorization", "Bearer " + token)
				.expect(400, done);
		});

		it("Delete a label that doesn't belong to the workspace", (done) => {
			request
				.delete(
					"/api/workspaces/" + labelsOtherWorkspaceId + "/labels/" + labelId
				)
				.set("Authorization", "Bearer " + token)
				.expect(400, done);
		});

		it("Delete successfuly", (done) => {
			request
				.delete("/api/workspaces/" + labelsWorkspaceId + "/labels/" + labelId)
				.set("Authorization", "Bearer " + token)
				.expect(200, done);
		});
	});

	describe("SampleController related tests", () => {
		before("Create a workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					samplesWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Generate submission id for the workspace", (done) => {
			request
				.get("/api/workspaces/" + samplesWorkspaceId + "/generateSubmissionId")
				.set("Authorization", "Bearer " + token)
				.expect(200)
				.then((res) => {
					expect(res.text).to.be.a("string");
					samplesWorkspaceSubmissionId = res.text;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create another workspace", (done) => {
			request
				.post("/api/workspaces/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(validWorkspace)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					samplesOtherWorkspaceId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Generate submission id for the other workspace", (done) => {
			request
				.get("/api/workspaces/" + samplesOtherWorkspaceId + "/generateSubmissionId")
				.set("Authorization", "Bearer " + token)
				.expect(200)
				.then((res) => {
					expect(res.text).to.be.a("string");
					samplesOtherWorkspaceSubmissionId = res.text;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create a label for the workspace", (done) => {
			request
				.post("/api/workspaces/" + samplesWorkspaceId + "/labels/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(label)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					labelId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create a label for the other workspace", (done) => {
			request
				.post("/api/workspaces/" + samplesOtherWorkspaceId + "/labels/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(label)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					otherWorkspaceLabelId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create another label for the workspace", (done) => {
			request
				.post("/api/workspaces/" + samplesWorkspaceId + "/labels/create")
				.set("Content-Type", "application/json")
				.set("Authorization", "Bearer " + token)
				.send(otherLabel)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					otherLabelId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create a sample for the workspace", (done) => {
			sample.submissionId = samplesWorkspaceSubmissionId;
			sampleNonExistingLabel.submissionId = samplesWorkspaceSubmissionId;
			sampleStartTimeLaterThanEnd.submissionId = samplesWorkspaceSubmissionId;
			sampleNonExistingSensor.submissionId = samplesWorkspaceSubmissionId;
			sampleWrongDataFormat.submissionId = samplesWorkspaceSubmissionId;
			request
				.post("/api/submitSample")
				.set("Content-Type", "application/json")
				.send(sample)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					sampleId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		before("Create a sample for the other workspace", (done) => {
			otherSample.submissionId = samplesOtherWorkspaceSubmissionId;
			request
				.post("/api/submitSample")
				.set("Content-Type", "application/json")
				.send(otherSample)
				.expect(200)
				.then((res) => {
					expect(res.body).to.be.a("string");
					otherSampleId = res.body;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		describe("GET /api/workspaces/:workspaceId/samples", () => {
			it("Retrieve samples without authentication", (done) => {
				request
					.get("/api/workspaces/" + samplesWorkspaceId + "/samples")
					.expect(401, done);
			});

			it("Retrieve samples of a non-existing workspace", (done) => {
				request
					.get("/api/workspaces/" + nonExistingWorkspaceId + "/samples")
					.set("Authorization", "Bearer " + token)
					.expect(400, done);
			});

			it("Retrieve samples without data points successfully", (done) => {
				request
					.get("/api/workspaces/" + samplesWorkspaceId + "/samples")
					.set("Authorization", "Bearer " + token)
					.query({ showDataPoints: "false" })
					.expect(200)
					.then((res) => {
						expect(res.body).to.be.an("array").that.contains.something.like({
							label: label.name,
							sampleId: sampleId,
						});
						done();
					})
					.catch((err) => {
						done(err);
					});
			});

			it("Retrieve samples' last modified dates successfully", (done) => {
				request
					.get("/api/workspaces/" + samplesWorkspaceId + "/samples")
					.set("Authorization", "Bearer " + token)
					.query({ onlyDate: "true" })
					.expect(200)
					.then((res) => {
						expect(res.body).to.be.a("number");
						done();
					})
					.catch((err) => {
						done(err);
					});
			});

			it("Retrieve samples with data points successfuly", (done) => {
				request
					.get("/api/workspaces/" + samplesWorkspaceId + "/samples")
					.set("Authorization", "Bearer " + token)
					.query({ showDataPoints: "true" })
					.expect(200)
					.then((res) => {
						expect(res.body)
							.to.be.an("array")
							.that.includes.something.like(samplesReturn);
						done();
					})
					.catch((err) => {
						done(err);
					});
			});
		});

		describe("GET /api/workspaces/:workspaceId/samples/:sampleId", () => {
			it("Retrieve a single sample without authentication", (done) => {
				request
					.get("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId)
					.expect(401, done);
			});

			it("Retrieve a single sample with an invalid id", (done) => {
				request
					.get("/api/workspaces/" + samplesWorkspaceId + "/samples/" + invalidSampleId)
					.set("Authorization", "Bearer " + token)
					.expect(400)
					.then((res) => {
						expect(res.text).to.be.a("string").that.equals("Invalid sample id");
						done();
					})
					.catch((err) => {
						done(err);
					});
			});

			it("Retrieve a non-existing sample", (done) => {
				request
					.get("/api/workspaces/" + samplesWorkspaceId + "/samples/" + nonExistingSampleId)
					.set("Authorization", "Bearer " + token)
					.expect(400)
					.then((res) => {
						expect(res.text).to.be.a("string").that.equals("Sample with given id does not exist");
						done();
					})
					.catch((err) => {
						done(err);
					});
			});

			it("Retrieve a sample that belongs to another workspace", (done) => {
				request
					.get("/api/workspaces/" + samplesWorkspaceId + "/samples/" + otherSampleId)
					.set("Authorization", "Bearer " + token)
					.expect(400)
					.then((res) => {
						expect(res.text).to.be.a("string").that
							.equals("Sample with given id does not belong to the workspace");
						done();
					})
					.catch((err) => {
						done(err);
					});
			});

			it("Retrieve a single sample successfully", (done) => {
				request
					.get("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId)
					.set("Authorization", "Bearer " + token)
					.expect(200)
					.then((res) => {
						expect(res.body).to.be.an("object").that.is.like(singleSampleReturn);
						done();
					})
					.catch((err) => {
						done(err);
					});
			});
		});

		describe("PUT /api/workspaces/:workspaceId/samples/:sampleId/relabel", () => {
			it("Relabel without authentication", (done) => {
				request
					.put("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId + "/relabel")
					.query({labelId: labelId})
					.expect(401, done);
			});

			it("Relabel with a non-existing label", (done) => {
				request
					.put("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId + "/relabel")
					.set("Authorization", "Bearer " + token)
					.query({labelId: nonExistingLabelId})
					.expect(400)
					.then((res) => {
						expect(res.text).to.be.a("string").that.equals("Label with given id does not exist");
						done();
					})
					.catch((err) => {
						done(err);
					});
			})

			it("Relabel with a label belonging to another workspace", (done) => {
				request
					.put("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId + "/relabel")
					.set("Authorization", "Bearer " + token)
					.query({labelId: otherWorkspaceLabelId})
					.expect(400)
					.then((res) => {
						expect(res.text).to.be.a("string").that.equals("This label does not belong to the workspace");
						done();
					})
					.catch((err) => {
						done(err);
					});
			})

			it("Relabel successfully", (done) => {
				request
					.put("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId + "/relabel")
					.set("Authorization", "Bearer " + token)
					.query({labelId: labelId})
					.expect(200, done);
			});
		});

		describe("PUT /api/workspaces/:workspaceId/samples/:sampleId/timeframes", () => {
			it("Update timeframes of a sample without authentication", (done) => {
				request
					.put("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId + "/timeframes")
					.query({labelId: labelId})
					.expect(401, done);
			});

			it("Update with timeframes with a timeframe that's start later than end", (done) => {
				request
				.put("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId + "/timeframes")
				.set("Authorization", "Bearer " + token)
				.set("Content-Type", "application/json")
				.send(timeframeStartLaterThanEnd)
				.expect(400)
				.then((res) => {
					expect(res.text).to.be.equal("Timeframe start should be earlier than end")
					done();
				})
				.catch((err) => {
					done(err);
				});
			});

			it("Update with not sorted timeframes", (done) => {
				request
				.put("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId + "/timeframes")
				.set("Authorization", "Bearer " + token)
				.set("Content-Type", "application/json")
				.send(timeframesNotSorted)
				.expect(400)
				.then((res) => {
					expect(res.text).to.be.equal("Timeframes are not sorted")
					done();
				})
				.catch((err) => {
					done(err);
				});
			});

			it("Update with intersecting timeframes", (done) => {
				request
				.put("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId + "/timeframes")
				.set("Authorization", "Bearer " + token)
				.set("Content-Type", "application/json")
				.send(timeframesIntersecting)
				.expect(400)
				.then((res) => {
					expect(res.text).to.be.equal("Timeframes should not be intersecting with each other")
					done();
				})
				.catch((err) => {
					done(err);
				});
			});

			it("Update with timeframes that isn't between start and end of the sample", (done) => {
				request
				.put("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId + "/timeframes")
				.set("Authorization", "Bearer " + token)
				.set("Content-Type", "application/json")
				.send(timeframeNotBetweenSampleStartEnd)
				.expect(400)
				.then((res) => {
					expect(res.text).to.be.equal("Timeframes should be between the start and the end of the sample")
					done();
				})
				.catch((err) => {
					done(err);
				});
			});

			it("Update timeframes successfully", (done) => {
				request
					.put("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId + "/timeframes")
					.set("Authorization", "Bearer " + token)
					.set("Content-Type", "application/json")
					.send(validTimeframes)
					.expect(200, done);
			});
		});

		describe("DELETE /api/workspaces/:workspaceId/samples/:sampleId", () => {
			it("Delete a sample without authentication", (done) => {
				request
					.delete("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId)
					.expect(401, done);
			});

			it("Delete a sample successfully", (done) => {
				request
					.delete("/api/workspaces/" + samplesWorkspaceId + "/samples/" + sampleId)
					.set("Authorization", "Bearer " + token)
					.expect(200, done);
			});
		});

		describe("POST /api/submitSample", () => {
			it("Submit sample without existing submission id", (done) => {
				request
					.post("/api/submitSample")
					.set("Content-Type", "application/json")
					.send(sampleNonExistingSubmissionId)
					.expect(400)
					.then((res) => {
						expect(res.text).to.be.equal("No workspace matched with given submission id");
						done();
					})
					.catch((err) => {
						done(err);
					})
			});

			it("Submit sample without existing label", (done) => {
				request
					.post("/api/submitSample")
					.set("Content-Type", "application/json")
					.send(sampleNonExistingLabel)
					.expect(400)
					.then((res) => {
						expect(res.text).to.be.equal("This label does not exist");
						done();
					})
					.catch((err) => {
						done(err);
					})
			})

			it("Submit sample with start time later than end time", (done) => {
				request
					.post("/api/submitSample")
					.set("Content-Type", "application/json")
					.send(sampleStartTimeLaterThanEnd)
					.expect(400)
					.then((res) => {
						expect(res.text).to.be.equal("Start time cannot be later than end time");
						done();
					})
					.catch((err) => {
						done(err);
					})
			})

			it("Submit sample with a sensor that doesn't belong to the workspace", (done) => {
				request
					.post("/api/submitSample")
					.set("Content-Type", "application/json")
					.send(sampleNonExistingSensor)
					.expect(400)
					.then((res) => {
						expect(res.text).to.be.equal("This sensor does not belong to the workspace");
						done();
					})
					.catch((err) => {
						done(err);
					})
			});

			it("Submit sample with data format not matching with sensor's", (done) => {
				request
					.post("/api/submitSample")
					.set("Content-Type", "application/json")
					.send(sampleWrongDataFormat)
					.expect(400)
					.then((res) => {
						expect(res.text).to.be.equal("Data format does not match the sensor's");
						done();
					})
					.catch((err) => {
						done(err);
					})
			});
			
		})
	});
});
