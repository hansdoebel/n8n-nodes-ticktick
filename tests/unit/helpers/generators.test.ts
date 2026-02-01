import { describe, expect, test } from "bun:test";
import {
	generateCheckinId,
	generateHabitId,
	generateId,
	generateProjectId,
	generateTaskId,
} from "../../../nodes/TickTick/helpers/generators";

describe("Generator Helper Functions", () => {
	describe("generateId", () => {
		test("generates ID of default length 24", () => {
			const id = generateId();
			expect(id).toHaveLength(24);
		});

		test("generates ID of specified length", () => {
			expect(generateId(16)).toHaveLength(16);
			expect(generateId(32)).toHaveLength(32);
			expect(generateId(8)).toHaveLength(8);
		});

		test("generates hex characters only", () => {
			const id = generateId(100);
			expect(id).toMatch(/^[0-9a-f]+$/);
		});

		test("generates different IDs on each call", () => {
			const ids = new Set<string>();
			for (let i = 0; i < 100; i++) {
				ids.add(generateId());
			}
			expect(ids.size).toBe(100);
		});

		test("handles edge case of length 0", () => {
			expect(generateId(0)).toBe("");
		});

		test("handles length 1", () => {
			const id = generateId(1);
			expect(id).toHaveLength(1);
			expect(id).toMatch(/^[0-9a-f]$/);
		});
	});

	describe("generateHabitId", () => {
		test("generates 24-character hex string", () => {
			const id = generateHabitId();
			expect(id).toHaveLength(24);
			expect(id).toMatch(/^[0-9a-f]+$/);
		});

		test("generates unique IDs", () => {
			const id1 = generateHabitId();
			const id2 = generateHabitId();
			expect(id1).not.toBe(id2);
		});
	});

	describe("generateCheckinId", () => {
		test("generates 24-character hex string", () => {
			const id = generateCheckinId();
			expect(id).toHaveLength(24);
			expect(id).toMatch(/^[0-9a-f]+$/);
		});

		test("generates unique IDs", () => {
			const id1 = generateCheckinId();
			const id2 = generateCheckinId();
			expect(id1).not.toBe(id2);
		});
	});

	describe("generateTaskId", () => {
		test("generates 24-character hex string", () => {
			const id = generateTaskId();
			expect(id).toHaveLength(24);
			expect(id).toMatch(/^[0-9a-f]+$/);
		});

		test("generates unique IDs", () => {
			const id1 = generateTaskId();
			const id2 = generateTaskId();
			expect(id1).not.toBe(id2);
		});
	});

	describe("generateProjectId", () => {
		test("generates 24-character hex string", () => {
			const id = generateProjectId();
			expect(id).toHaveLength(24);
			expect(id).toMatch(/^[0-9a-f]+$/);
		});

		test("generates unique IDs", () => {
			const id1 = generateProjectId();
			const id2 = generateProjectId();
			expect(id1).not.toBe(id2);
		});
	});

	describe("ID format compatibility", () => {
		test("all generators produce MongoDB-style ObjectIds", () => {
			const habitId = generateHabitId();
			const checkinId = generateCheckinId();
			const taskId = generateTaskId();
			const projectId = generateProjectId();

			const mongoObjectIdPattern = /^[0-9a-f]{24}$/;

			expect(habitId).toMatch(mongoObjectIdPattern);
			expect(checkinId).toMatch(mongoObjectIdPattern);
			expect(taskId).toMatch(mongoObjectIdPattern);
			expect(projectId).toMatch(mongoObjectIdPattern);
		});
	});
});
