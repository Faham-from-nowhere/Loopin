import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walk(dirPath, callback);
        } else if (dirPath.endsWith('.js') || dirPath.endsWith('.jsx')) {
            callback(dirPath);
        }
    });
}

const envVar = "(import.meta.env.VITE_API_URL || 'http://localhost:8000')";

walk(path.join(process.cwd(), 'src'), (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Handle string literals 'http://localhost:8000/...' -> `${envVar}/...`
    if (content.includes("'http://localhost:8000")) {
        content = content.replace(/'http:\/\/localhost:8000([^']*)'/g, "`\\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}$1`");
        changed = true;
    }
    
    // Handle double quote literals "http://localhost:8000/..." -> `${envVar}/...`
    if (content.includes('"http://localhost:8000')) {
        content = content.replace(/"http:\/\/localhost:8000([^"]*)"/g, "`\\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}$1`");
        changed = true;
    }

    // Handle template literals `http://localhost:8000/...` -> `${envVar}/...`
    if (content.includes('`http://localhost:8000')) {
        content = content.replace(/`http:\/\/localhost:8000/g, "`\\${import.meta.env.VITE_API_URL || 'http://localhost:8000'}");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
});
