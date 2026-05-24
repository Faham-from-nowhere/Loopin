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

walk(path.join(process.cwd(), 'src'), (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('\\${import.meta.env.VITE_API_URL')) {
        content = content.replace(/\\\$\{import\.meta\.env\.VITE_API_URL/g, '${import.meta.env.VITE_API_URL');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', filePath);
    }
});
