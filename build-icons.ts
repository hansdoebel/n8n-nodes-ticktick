import { Glob } from "bun";
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const directories = [
	{ src: "nodes", dest: "dist/nodes" },
	{ src: "credentials", dest: "dist/credentials" },
	{ src: "icons", dest: "dist/icons" },
];

const glob = new Glob("**/*.{png,svg}");

let copied = 0;

for (const { src: srcDir, dest: distDir } of directories) {
	for await (const file of glob.scan(srcDir)) {
		const src = join(srcDir, file);
		const dest = join(distDir, file);

		await mkdir(dirname(dest), { recursive: true });
		await copyFile(src, dest);
		copied++;
		console.log(`✓ ${dest}`);
	}
}

console.log(`\n✅ Copied ${copied} icon(s)`);
