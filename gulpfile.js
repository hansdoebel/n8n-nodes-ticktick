const path = require('path');
const { task, src, dest } = require('gulp');

task('build:icons', copyIcons);

function copyIcons() {
	const nodeSource = path.resolve('nodes', '**', '*.{png,svg}');
	const nodeDestination = path.resolve('dist', 'nodes');

	src(nodeSource).pipe(dest(nodeDestination));

	const credSource = path.resolve('credentials', '**', '*.{png,svg}');
	const credDestination = path.resolve('dist', 'credentials');

	src(credSource).pipe(dest(credDestination));

	const iconsSource = path.resolve('icons', '*.{png,svg}');
	const iconsDestination = path.resolve('dist', 'icons');

	return src(iconsSource).pipe(dest(iconsDestination));
}
