import { createTestClient, type TickTickTestClient } from "./utils/testClient";

describe("TickTick V2 Projects Resource", () => {
	let client: TickTickTestClient;

	beforeAll(async () => {
		client = await createTestClient();
	}, 20000);

	afterAll(() => {
		client?.disconnect();
	});

	test("GET /projects - list all projects", async () => {
		const response = await client.get("/projects");

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(Array.isArray(response.data) || typeof response.data === "object")
			.toBe(true);
	}, 10000);
});
