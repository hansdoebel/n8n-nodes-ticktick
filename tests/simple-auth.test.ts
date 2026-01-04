import * as dotenv from "dotenv";
import * as https from "https";
import * as http from "http";

// Load environment variables
dotenv.config();

const V2_API_BASE = "https://api.ticktick.com/api/v2";
const V2_USER_AGENT =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:146.0) Gecko/20100101 Firefox/146.0";
const V2_DEVICE_VERSION = 6440;

/**
 * Generate a device ID (24 hex chars)
 */
function generateDeviceId(): string {
	const chars = "0123456789abcdef";
	let result = "";
	for (let i = 0; i < 24; i++) {
		result += chars[Math.floor(Math.random() * chars.length)];
	}
	return result;
}

/**
 * Make HTTP request using Node.js built-in https module
 */
function makeRequest(
	url: string,
	options: https.RequestOptions,
	body?: any,
): Promise<
	{ body: any; headers: http.IncomingHttpHeaders; statusCode: number }
> {
	return new Promise((resolve, reject) => {
		const urlObj = new URL(url);

		// Prepare body data
		const bodyData = body
			? typeof body === "string" ? body : JSON.stringify(body)
			: null;

		const requestOptions: https.RequestOptions = {
			...options,
			hostname: urlObj.hostname,
			path: urlObj.pathname + urlObj.search,
			protocol: urlObj.protocol,
			headers: {
				...options.headers,
				...(bodyData && {
					"Content-Length": Buffer.byteLength(bodyData),
				}),
			},
		};

		const req = https.request(requestOptions, (res) => {
			let data = "";
			res.on("data", (chunk) => (data += chunk));
			res.on("end", () => {
				try {
					const parsedBody = data ? JSON.parse(data) : {};
					resolve({
						body: parsedBody,
						headers: res.headers,
						statusCode: res.statusCode || 500,
					});
				} catch {
					resolve({
						body: data,
						headers: res.headers,
						statusCode: res.statusCode || 500,
					});
				}
			});
		});

		req.on("error", reject);

		if (bodyData) {
			req.write(bodyData);
		}

		req.end();
	});
}

describe("TickTick V2 Simple Authentication (like ticktick-py)", () => {
	const username = process.env.TICKTICK_USERNAME;
	const password = process.env.TICKTICK_PASSWORD;

	beforeAll(() => {
		if (!username || !password) {
			throw new Error(
				"Please create a .env file with TICKTICK_USERNAME and TICKTICK_PASSWORD",
			);
		}
	});

	test("2-step authentication: GET /signin then POST /signon", async () => {
		const deviceId = generateDeviceId();

		console.log("Username:", username);
		console.log("Password length:", password?.length);
		console.log("Device ID:", deviceId);

		// STEP 1: GET /signin to get AWS load balancer cookies
		console.log("\nStep 1: Getting AWS cookies from /signin...");
		const signinResponse = await makeRequest(
			"https://ticktick.com/signin",
			{
				method: "GET",
				headers: {
					"User-Agent": V2_USER_AGENT,
					"Accept":
						"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
					"Accept-Language": "en-US,en;q=0.9",
				},
			},
		);

		// Extract cookies
		function extractCookies(
			setCookieHeaders: string | string[],
		): Record<string, string> {
			const cookies: Record<string, string> = {};
			const cookieArray = Array.isArray(setCookieHeaders)
				? setCookieHeaders
				: [setCookieHeaders];
			for (const cookieHeader of cookieArray) {
				const match = cookieHeader.match(/^([^=]+)=([^;]+)/);
				if (match) {
					const [, name, value] = match;
					if (
						value && value !== '""' &&
						!cookieHeader.includes("Expires=Thu, 01 Jan 1970")
					) {
						cookies[name] = value;
					}
				}
			}
			return cookies;
		}

		const sessionCookies = extractCookies(
			signinResponse.headers["set-cookie"] || [],
		);
		console.log("AWS cookies obtained:", Object.keys(sessionCookies));

		const cookieHeader = Object.entries(sessionCookies)
			.map(([name, value]) => `${name}=${value}`)
			.join("; ");

		// STEP 2: POST /signon with AWS cookies
		console.log("\nStep 2: Authenticating with credentials...");
		const xDeviceHeader = JSON.stringify({
			platform: "web",
			os: "macOS 10.15",
			device: "Firefox 146.0",
			name: "",
			version: V2_DEVICE_VERSION,
			id: deviceId,
			channel: "website",
			campaign: "",
			websocket: "",
		});

		const signonResponse = await makeRequest(
			`${V2_API_BASE}/user/signon?wc=true&remember=true`,
			{
				method: "POST",
				headers: {
					"User-Agent": V2_USER_AGENT,
					"Accept": "*/*",
					"Accept-Language": "en-US,en;q=0.9",
					"Content-Type": "application/json",
					"X-Device": xDeviceHeader,
					"X-Requested-With": "XMLHttpRequest",
					"Origin": "https://ticktick.com",
					"Referer": "https://ticktick.com/",
					"Cookie": cookieHeader,
				},
			},
			{ username, password },
		);

		console.log("Response status:", signonResponse.statusCode);
		console.log("Response body:", JSON.stringify(signonResponse.body, null, 2));
		console.log("Response headers:", signonResponse.headers);

		const authBody = signonResponse.body;

		if (authBody.errorMessage) {
			console.error("Error:", authBody.errorMessage);
			console.error("Error code:", authBody.errorCode);
		}

		// Check if successful
		expect(signonResponse.statusCode).toBe(200);
		expect(authBody.errorCode).toBeUndefined();
	}, 15000);
});
