import {
	createTestClient,
	type TickTickTestClient,
	uniqueName,
} from "./utils/testClient";

describe("TickTick V2 Tags Resource", () => {
	let client: TickTickTestClient;
	let sourceLabel: string;
	let targetLabel: string;
	let sourceName: string;
	let targetName: string;

	beforeAll(async () => {
		client = await createTestClient();
		sourceLabel = uniqueName("Tag Source");
		targetLabel = uniqueName("Tag Target");
		sourceName = normalizeTagName(sourceLabel);
		targetName = normalizeTagName(targetLabel);
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

	test("Tag create/update/rename/merge/delete flow", async () => {
		let mergedTargetName: string | null = null;

		try {
			const createResponse = await client.post("/batch/tag", {
				add: [
					{ label: sourceLabel, name: sourceName },
					{ label: targetLabel, name: targetName },
				],
			});

			expect(createResponse.statusCode).toBe(200);

			const updatedLabel = uniqueName("Tag Updated");
			const updateResponse = await client.post("/batch/tag", {
				update: [
					{
						name: sourceName,
						label: updatedLabel,
						rawName: sourceName,
					},
				],
			});

			expect(updateResponse.statusCode).toBe(200);

			const renamedLabel = uniqueName("Tag Renamed");
			const renameResponse = await client.put("/tag/rename", {
				name: targetName,
				newName: renamedLabel,
			});

			expect(renameResponse.statusCode).toBe(200);

			const syncResponse = await client.get("/batch/check/0");
			expect(syncResponse.statusCode).toBe(200);

			const tags = Array.isArray(syncResponse.data?.tags)
				? syncResponse.data.tags
				: [];
			const renamedTag = tags.find(
				(tag: { label?: string; name?: string }) =>
					tag.label === renamedLabel || tag.name === targetName,
			);

			mergedTargetName = renamedTag?.name || targetName;

			const mergeResponse = await client.put("/tag/merge", {
				name: sourceName,
				newName: mergedTargetName,
			});

			expect(mergeResponse.statusCode).toBe(200);
		} finally {
			const deleteTargets = [sourceName, mergedTargetName, targetName]
				.filter((name, index, self): name is string =>
					typeof name === "string" && self.indexOf(name) === index
				);

			for (const name of deleteTargets) {
				const deleteResponse = await client.delete(
					`/tag?name=${encodeURIComponent(name)}`,
				);

				expect([200, 204]).toContain(deleteResponse.statusCode);
			}
		}
	}, 15000);
});

function normalizeTagName(label: string): string {
	return label.toLowerCase().replace(/\s+/g, "");
}
