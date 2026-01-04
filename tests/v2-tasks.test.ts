import { createTestClient, type TickTickTestClient } from "./utils/testClient";

describe("TickTick V2 Tasks Resource", () => {
	let client: TickTickTestClient;

	beforeAll(async () => {
		client = await createTestClient();
	}, 20000);

	afterAll(() => {
		client?.disconnect();
	});

	test("GET /project/all/trash/pagination - list deleted tasks", async () => {
		const response = await client.get("/project/all/trash/pagination?start=0&limit=50");

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(typeof response.data).toBe("object");
	}, 10000);
});
