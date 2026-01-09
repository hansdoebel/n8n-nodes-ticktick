import type { ILoadOptionsFunctions } from "n8n-workflow";
import { getHabits } from "@ticktick/helpers";

export const habitMethods = {
	loadOptions: {
		async getHabits(this: ILoadOptionsFunctions) {
			return await getHabits.call(this);
		},
	},
};
