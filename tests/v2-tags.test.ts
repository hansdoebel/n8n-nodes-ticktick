import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
	createTestClient,
	type TickTickTestClient,
	uniqueName,
} from "./utils/testClient";
import { ENDPOINTS } from "./utils/endpoints";

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

	test("GET /batch/check/0 - list all tags", async () => {
		const response = await client.get(ENDPOINTS.SYNC);

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(typeof response.data).toBe("object");
		expect(
			Array.isArray(response.data.tags) || response.data.tags === undefined,
		)
			.toBe(true);
	}, 10000);

	test("Tag create/update/rename/merge/delete flow", async () => {
		let mergedTargetName: string | null = null;

		try {
			const createResponse = await client.post(ENDPOINTS.TAGS_BATCH, {
				add: [
					{ label: sourceLabel, name: sourceName },
					{ label: targetLabel, name: targetName },
				],
			});

			expect(createResponse.statusCode).toBe(200);

			const updatedLabel = uniqueName("Tag Updated");
			const updateResponse = await client.post(ENDPOINTS.TAGS_BATCH, {
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
			const renameResponse = await client.put(ENDPOINTS.TAG_RENAME, {
				name: targetName,
				newName: renamedLabel,
			});

			expect(renameResponse.statusCode).toBe(200);

			const syncResponse = await client.get(ENDPOINTS.SYNC);
			expect(syncResponse.statusCode).toBe(200);

			const tags = Array.isArray(syncResponse.data?.tags)
				? syncResponse.data.tags
				: [];
			const renamedTag = tags.find(
				(tag: { label?: string; name?: string }) =>
					tag.label === renamedLabel || tag.name === targetName,
			);

			mergedTargetName = renamedTag?.name || targetName;

			const mergeResponse = await client.put(ENDPOINTS.TAG_MERGE, {
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
