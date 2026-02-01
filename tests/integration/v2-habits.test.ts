import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
	createTestClient,
	type TickTickTestClient,
	uniqueName,
} from "./utils/testClient";
import { ENDPOINTS } from "./utils/endpoints";

describe("TickTick V2 Habits Resource", () => {
	let client: TickTickTestClient;

	beforeAll(async () => {
		client = await createTestClient();
	}, 20000);

	afterAll(() => {
		client?.disconnect();
	});

	test("GET /habits - list all habits", async () => {
		const response = await client.get(ENDPOINTS.HABITS);

		expect(response.statusCode).toBe(200);
		expect(response.data).toBeDefined();
		expect(Array.isArray(response.data) || typeof response.data === "object")
			.toBe(true);
	}, 10000);

	test("Habit create/update/archive/unarchive/delete flow", async () => {
		const generateId = (length: number = 24): string => {
			return Array.from(
				{ length },
				() => Math.floor(Math.random() * 16).toString(16),
			).join("");
		};

		const habitName = uniqueName("TestHabit");
		const habitId = generateId(24);

		const createBody = {
			add: [
				{
					id: habitId,
					name: habitName,
					type: "Boolean",
					color: "#97E38B",
					icon: "habit_daily_check_in",
					repeatRule: "RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA",
					status: 0,
				},
			],
			update: [],
			delete: [],
		};

		const createResponse = await client.post(
			ENDPOINTS.HABITS_BATCH,
			createBody,
		);
		expect(createResponse.statusCode).toBe(200);
		expect(createResponse.data).toBeDefined();

		const updatedName = `${habitName}_Updated`;
		const updateBody = {
			add: [],
			update: [
				{
					id: habitId,
					name: updatedName,
					type: "Boolean",
					color: "#97E38B",
					icon: "habit_daily_check_in",
					repeatRule: "RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA",
					status: 0,
				},
			],
			delete: [],
		};

		const updateResponse = await client.post(
			ENDPOINTS.HABITS_BATCH,
			updateBody,
		);
		expect(updateResponse.statusCode).toBe(200);

		const archiveBody = {
			add: [],
			update: [
				{
					id: habitId,
					name: updatedName,
					type: "Boolean",
					color: "#97E38B",
					icon: "habit_daily_check_in",
					repeatRule: "RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA",
					status: 2,
				},
			],
			delete: [],
		};

		const archiveResponse = await client.post(
			ENDPOINTS.HABITS_BATCH,
			archiveBody,
		);
		expect(archiveResponse.statusCode).toBe(200);

		const unarchiveBody = {
			add: [],
			update: [
				{
					id: habitId,
					name: updatedName,
					type: "Boolean",
					color: "#97E38B",
					icon: "habit_daily_check_in",
					repeatRule: "RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA",
					status: 0,
				},
			],
			delete: [],
		};

		const unarchiveResponse = await client.post(
			ENDPOINTS.HABITS_BATCH,
			unarchiveBody,
		);
		expect(unarchiveResponse.statusCode).toBe(200);

		const deleteBody = {
			add: [],
			update: [],
			delete: [habitId],
		};

		const deleteResponse = await client.post(
			ENDPOINTS.HABITS_BATCH,
			deleteBody,
		);
		expect(deleteResponse.statusCode).toBe(200);
	}, 30000);

	test("Habit checkin flow", async () => {
		const generateId = (length: number = 24): string => {
			return Array.from(
				{ length },
				() => Math.floor(Math.random() * 16).toString(16),
			).join("");
		};

		const formatDateStampYYYYMMDD = (date: Date): number => {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			return Number.parseInt(`${year}${month}${day}`, 10);
		};

		const formatISO8601WithMillis = (date: Date): string => {
			return date.toISOString().replace(/\.\d{3}Z$/, ".000+0000");
		};

		const habitName = uniqueName("TestHabit");
		const habitId = generateId(24);

		const createBody = {
			add: [
				{
					id: habitId,
					name: habitName,
					type: "Boolean",
					color: "#97E38B",
					icon: "habit_daily_check_in",
					repeatRule: "RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA",
					status: 0,
				},
			],
			update: [],
			delete: [],
		};

		const createResponse = await client.post(
			ENDPOINTS.HABITS_BATCH,
			createBody,
		);
		expect(createResponse.statusCode).toBe(200);

		const now = new Date();
		const checkinId = generateId(24);
		const checkinStamp = formatDateStampYYYYMMDD(now);
		const timestamp = formatISO8601WithMillis(now);

		const checkinBody = {
			add: [
				{
					id: checkinId,
					habitId: habitId,
					checkinStamp: checkinStamp,
					checkinTime: timestamp,
					opTime: timestamp,
					value: 1,
					goal: 1,
					status: 1,
				},
			],
			update: [],
			delete: [],
		};

		const checkinResponse = await client.post(
			ENDPOINTS.HABIT_CHECKINS_BATCH,
			checkinBody,
		);
		expect(checkinResponse.statusCode).toBe(200);

		const deleteCheckinBody = {
			add: [],
			update: [],
			delete: [
				{
					id: checkinId,
					habitId: habitId,
				},
			],
		};

		const deleteCheckinResponse = await client.post(
			ENDPOINTS.HABIT_CHECKINS_BATCH,
			deleteCheckinBody,
		);
		expect([200, 500]).toContain(deleteCheckinResponse.statusCode);

		const deleteHabitBody = {
			add: [],
			update: [],
			delete: [habitId],
		};

		const deleteHabitResponse = await client.post(
			ENDPOINTS.HABITS_BATCH,
			deleteHabitBody,
		);
		expect(deleteHabitResponse.statusCode).toBe(200);
	}, 30000);

	test("Habit get - retrieve single habit by ID", async () => {
		const generateId = (length: number = 24): string => {
			return Array.from(
				{ length },
				() => Math.floor(Math.random() * 16).toString(16),
			).join("");
		};

		const habitName = uniqueName("TestHabitGet");
		const habitId = generateId(24);

		const createBody = {
			add: [
				{
					id: habitId,
					name: habitName,
					type: "Boolean",
					color: "#97E38B",
					icon: "habit_daily_check_in",
					repeatRule: "RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA",
					status: 0,
				},
			],
			update: [],
			delete: [],
		};

		const createResponse = await client.post(
			ENDPOINTS.HABITS_BATCH,
			createBody,
		);
		expect(createResponse.statusCode).toBe(200);

		const habitsResponse = await client.get(ENDPOINTS.HABITS);
		expect(habitsResponse.statusCode).toBe(200);

		const habits = Array.isArray(habitsResponse.data)
			? habitsResponse.data
			: [];
		const habit = habits.find((h: any) => h.id === habitId);

		expect(habit).toBeDefined();
		expect(habit.name).toBe(habitName);
		expect(habit.type).toBe("Boolean");
		expect(habit.color).toBe("#97E38B");

		const deleteBody = {
			add: [],
			update: [],
			delete: [habitId],
		};
		await client.post(ENDPOINTS.HABITS_BATCH, deleteBody);
	}, 30000);
});
