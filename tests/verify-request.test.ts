import * as dotenv from "dotenv";

dotenv.config();

const V2_API_BASE = "https://api.ticktick.com/api/v2";
const username = process.env.TICKTICK_USERNAME;
const password = process.env.TICKTICK_PASSWORD;

function generateDeviceId(): string {
	const chars = "0123456789abcdef";
	let result = "";
	for (let i = 0; i < 24; i++) {
		result += chars[Math.floor(Math.random() * chars.length)];
	}
	return result;
}

describe("Verify exact request format", () => {
	test("Log the exact HTTP request", async () => {
		const deviceId = generateDeviceId();
		const xDevice = JSON.stringify({
			platform: "web",
			version: 6430,
			id: deviceId,
		});

		const bodyData = JSON.stringify({ username, password });

		console.log("=== REQUEST DEBUG ===");
		console.log("URL:", `${V2_API_BASE}/user/signon?wc=true&remember=true`);
		console.log("Method: POST");
		console.log("Headers:");
		console.log("  User-Agent:", "Mozilla/5.0 (rv:145.0) Firefox/145.0");
		console.log("  X-Device:", xDevice);
		console.log("  Content-Type: application/json");
		console.log("  Content-Length:", Buffer.byteLength(bodyData));
		console.log("Body:", bodyData);
		console.log(
			"Body bytes:",
			Buffer.from(bodyData).toString("hex").substring(0, 200) + "...",
		);

		expect(true).toBe(true);
	});
});
