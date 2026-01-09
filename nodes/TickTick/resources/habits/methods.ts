import type { ILoadOptionsFunctions } from "n8n-workflow";
import { getHabits } from "@ticktick/GenericFunctions";

export const habitMethods = {
	loadOptions: {
		async getHabits(this: ILoadOptionsFunctions) {
			return await getHabits.call(this);
		},
	},
};
