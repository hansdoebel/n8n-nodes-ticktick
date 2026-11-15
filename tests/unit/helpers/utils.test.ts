import { describe, expect, test } from "bun:test";
import { ENDPOINTS } from "../../../nodes/TickTick/helpers/constants";
import { validatePathParam } from "../../../nodes/TickTick/helpers/utils";

describe("validatePathParam", () => {
	test("accepts letters, numbers, hyphens, and underscores", () => {
		expect(validatePathParam("project_1-A", "projectId")).toBe("project_1-A");
	});

	test("rejects empty values and characters that would change the path", () => {
		for (const value of ["", "../task", "a/b", "id?x=1", "id with space", "id#frag"]) {
			expect(() => validatePathParam(value, "projectId")).toThrow(
				/Invalid projectId/,
			);
		}
	});

	test("endpoint helpers reject a project id that is not a single path segment", () => {
		expect(() => ENDPOINTS.OPEN_V1_PROJECT_BY_ID("../secret")).toThrow(
			/Invalid projectId/,
		);
		expect(() => ENDPOINTS.OPEN_V1_PROJECT_DATA("a/b")).toThrow(
			/Invalid projectId/,
		);
		expect(() => ENDPOINTS.PROJECT_USERS("project?x=1")).toThrow(
			/Invalid projectId/,
		);
		expect(ENDPOINTS.OPEN_V1_PROJECT_BY_ID("project456")).toBe(
			"/open/v1/project/project456",
		);
	});
});
