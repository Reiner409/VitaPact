import { findInstallers, MAX_INSTALLER_BYTES, oversizedInstallers } from './installerSize.ts';

const directories = process.argv.slice(2);
if (directories.length === 0) {
  console.error('Usage: check-installer-size <bundle directory>...');
  process.exit(2);
}

const installers = directories.flatMap(findInstallers);
const megabytes = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);

if (installers.length === 0) {
  console.error('No installer found.');
  process.exit(1);
}
for (const { path, bytes } of installers) console.log(`${path}: ${megabytes(bytes)} MB`);

const oversized = oversizedInstallers(installers);
if (oversized.length > 0) {
  console.error(`Installers must stay under ${megabytes(MAX_INSTALLER_BYTES)} MB (RNF-09).`);
  process.exit(1);
}
