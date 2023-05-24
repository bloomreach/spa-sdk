import { execSync } from 'child_process';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fsPromises } from 'fs';

const { readFile } = fsPromises;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJsonPaths = await glob("{examples,packages}/**/package.json", {
  ignore: '**/node_modules/**',
  cwd: __dirname,
});

const packageJsons = await Promise.all(
  packageJsonPaths.map(async (path) => {
    const data = await readFile(`${__dirname}/${path}`);
    return {
      path: dirname(path),
      data: JSON.parse(data),
    };
  })
);

packageJsons.forEach(({ path, data: packageJson }) => {
  console.log(`\nLinking dependencies for ${packageJson.name}`);

  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
  };

  if (dependencies) {
    Object.keys(dependencies)
      .filter((dep) => dep.startsWith('@bloomreach/') && dep.endsWith('-sdk'))
      .forEach((dep) => {
        execSync(`yalc link ${dep}`, { stdio: 'inherit', cwd: join(__dirname, path) });
      });
  }
});
