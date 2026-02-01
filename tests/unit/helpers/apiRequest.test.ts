import { describe, expect, test } from "bun:test";
import {
	getAuthenticationType,
	isV2Auth,
} from "../../../nodes/TickTick/helpers/apiRequest";
import { createMockExecuteFunctions } from "../__mocks__/n8nContext";

describe("API Request Helper Functions", () => {
	describe("getAuthenticationType", () => {
		test("returns tickTickTokenApi by default", () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickTokenApi",
			});
			const result = getAuthenticationType(mockContext as any);
			expect(result).toBe("tickTickTokenApi");
		});

		test("returns tickTickOAuth2Api when configured", () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickOAuth2Api",
			});
			const result = getAuthenticationType(mockContext as any);
			expect(result).toBe("tickTickOAuth2Api");
		});

		test("returns tickTickSessionApi when configured", () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
			});
			const result = getAuthenticationType(mockContext as any);
			expect(result).toBe("tickTickSessionApi");
		});

		test("respects itemIndex parameter", () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
			});
			const result = getAuthenticationType(mockContext as any, 5);
			expect(result).toBe("tickTickSessionApi");
			expect(mockContext.getNodeParameter).toHaveBeenCalledWith(
				"authentication",
				5,
			);
		});
	});

	describe("isV2Auth", () => {
		test("returns true for tickTickSessionApi", () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
			});
			const result = isV2Auth(mockContext as any);
			expect(result).toBe(true);
		});

		test("returns false for tickTickTokenApi", () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickTokenApi",
			});
			const result = isV2Auth(mockContext as any);
			expect(result).toBe(false);
		});

		test("returns false for tickTickOAuth2Api", () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickOAuth2Api",
			});
			const result = isV2Auth(mockContext as any);
			expect(result).toBe(false);
		});

		test("respects itemIndex parameter", () => {
			const mockContext = createMockExecuteFunctions({
				authentication: "tickTickSessionApi",
			});
			const result = isV2Auth(mockContext as any, 3);
			expect(result).toBe(true);
			expect(mockContext.getNodeParameter).toHaveBeenCalledWith(
				"authentication",
				3,
			);
		});

		test("defaults to false when authentication is undefined", () => {
			const mockContext = createMockExecuteFunctions({
				nodeParameters: {},
			});
			const result = isV2Auth(mockContext as any);
			expect(result).toBe(false);
		});
	});
});
