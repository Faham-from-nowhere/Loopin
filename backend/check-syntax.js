import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (file !== 'node_modules') filelist = walkSync(dirFile, filelist);
    } else {
      if (file.endsWith('.js')) filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync(__dirname);
let errors = 0;
files.forEach(file => {
  try {
    execSync(`node -c "${file}"`, { stdio: 'ignore' });
  } catch (e) {
    console.error(`Syntax error in: ${file}`);
    try {
      execSync(`node -c "${file}"`, { stdio: 'pipe' });
    } catch (err) {
      console.error(err.stderr ? err.stderr.toString() : err.message);
    }
    errors++;
  }
});

if (errors === 0) {
  console.log('No syntax errors found in backend.');
} else {
  console.log(`${errors} files with syntax errors.`);
}
