import { createTestClient, type TickTickTestClient } from "./utils/testClient";

describe("TickTick V2 User Resource", () => {
	let client: TickTickTestClient;

	beforeAll(async () => {
		client = await createTestClient();
	}, 20000);

	afterAll(() => {
		client?.disconnect();
	});

	test("GET /user/profile - returns user profile", async () => {
		const response = await client.get("/user/profile");

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(typeof response.data).toBe("object");
	}, 10000);

	test("GET /user/status - returns user status", async () => {
		const response = await client.get("/user/status");

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(typeof response.data).toBe("object");
	}, 10000);

	test("GET /user/preferences - returns user preferences", async () => {
		const response = await client.get(
			"/user/preferences/settings?includeWeb=true",
		);

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(typeof response.data).toBe("object");
	}, 10000);
});
