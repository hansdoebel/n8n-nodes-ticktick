import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

describe("Debug Credentials", () => {
	test("Show credential info", () => {
		const username = process.env.TICKTICK_USERNAME;
		const password = process.env.TICKTICK_PASSWORD;

		console.log("=== CREDENTIAL DEBUG INFO ===");
		console.log("Username:", username);
		console.log("Username length:", username?.length);
		console.log(
			"Username bytes:",
			Buffer.from(username || "", "utf-8").toString("hex"),
		);
		console.log("");
		console.log("Password:", password);
		console.log("Password length:", password?.length);
		console.log(
			"Password bytes:",
			Buffer.from(password || "", "utf-8").toString("hex"),
		);
		console.log("");
		console.log("JSON stringified body:");
		console.log(JSON.stringify({ username, password }, null, 2));
		console.log("");
		console.log("Raw JSON (what will be sent):");
		console.log(JSON.stringify({ username, password }));

		expect(username).toBeDefined();
		expect(password).toBeDefined();
	});
});
