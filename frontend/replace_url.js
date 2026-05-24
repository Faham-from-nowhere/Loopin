import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walk(dirPath, callback);
        } else if (dirPath.endsWith('.js') || dirPath.endsWith('.jsx')) {
            callback(dirPath);
        }
    });
}

walk(path.join(process.cwd(), 'src'), (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('http://localhost:8000')) {
        // Special case for socket io
        content = content.replace(/io\('http:\/\/localhost:8000'/g, "io(window.location.origin");
        content = content.replace(/io\(`http:\/\/localhost:8000`/g, "io(window.location.origin");
        
        // General API calls
        content = content.replace(/http:\/\/localhost:8000/g, "");
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
});
