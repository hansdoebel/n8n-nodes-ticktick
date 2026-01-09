import { ResourceRegistry } from "../types/registry";
import { taskResource } from "./tasks";
import { projectResource } from "./projects";
import { tagResource } from "./tags";
import { habitResource } from "./habits";
import { focusResource } from "./focus";
import { projectGroupResource } from "./projectGroups";
import { userResource } from "./user";
import { syncResource } from "./sync";
import { sharedMethods } from "./shared/methods";

export const registry = new ResourceRegistry();

registry.register(taskResource);
registry.register(projectResource);
registry.register(tagResource);
registry.register(habitResource);
registry.register(focusResource);
registry.register(projectGroupResource);
registry.register(userResource);
registry.register(syncResource);

export { sharedMethods };
export { taskResource } from "./tasks";
export { projectResource } from "./projects";
export { tagResource } from "./tags";
export { habitResource } from "./habits";
export { focusResource } from "./focus";
export { projectGroupResource } from "./projectGroups";
export { userResource } from "./user";
export { syncResource } from "./sync";
