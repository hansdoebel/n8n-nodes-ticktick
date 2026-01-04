import { createTestClient, type TickTickTestClient } from "./utils/testClient";

describe("TickTick V2 Tags Resource", () => {
	let client: TickTickTestClient;

	beforeAll(async () => {
		client = await createTestClient();
	}, 20000);

	afterAll(() => {
		client?.disconnect();
	});

	test("GET /tags - list all tags", async () => {
		const response = await client.get("/tags");

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(Array.isArray(response.data) || typeof response.data === "object")
			.toBe(true);
	}, 10000);
});
