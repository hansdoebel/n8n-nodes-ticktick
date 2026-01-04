import { createTestClient, type TickTickTestClient } from "./utils/testClient";

describe("TickTick V2 Sync Resource", () => {
	let client: TickTickTestClient;

	beforeAll(async () => {
		client = await createTestClient();
	}, 20000);

	afterAll(() => {
		client?.disconnect();
	});

	test("GET /batch/check/0 - initial sync", async () => {
		const response = await client.get("/batch/check/0");

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(typeof response.data).toBe("object");
	}, 10000);
});
