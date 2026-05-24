import fs from 'fs';
import path from 'path';

const files = [
  'src/components/CreatePost.jsx',
  'src/components/CommentDialog.jsx',
  'src/components/Feed.jsx',
  'src/components/Home.jsx',
  'src/components/LeftSidebar.jsx',
  'src/components/Login.jsx',
  'src/components/MainLayout.jsx',
  'src/components/Post.jsx',
  'src/components/Posts.jsx',
  'src/components/Profile.jsx',
  'src/components/RightSidebar.jsx',
  'src/components/Signup.jsx',
  'src/components/ui/avatar.jsx',
  'src/components/ui/button.jsx',
  'src/components/ui/dialog.jsx',
  'src/components/ui/input.jsx',
  'src/components/ui/label.jsx',
  'src/components/ui/textarea.jsx',
  'src/hooks/useGetAllPost.jsx',
  'src/main.jsx',
];

files.forEach(f => {
  const p = path.join(process.cwd(), f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    // Remove `import React from "react"` or `import React, { ... } from "react"`
    content = content.replace(/import\s+React\s*,\s*\{([^}]+)\}\s*from\s+["']react["'];?/g, 'import {$1} from "react";');
    content = content.replace(/import\s+React\s+from\s+["']react["'];?/g, '');
    content = content.replace(/import\s+\*\s+as\s+React\s+from\s+["']react["'];?/g, '');
    // Fix specific cases
    if (f.endsWith('main.jsx')) {
      content = content.replace(/import\s+\{\s*StrictMode\s*\}\s*from\s+['"]react['"];?\n?/, '');
    }
    if (f.endsWith('useGetAllPost.jsx')) {
      content = content.replace(/import\s+\{\s*setPosts\s*\}\s*from\s+['"]@\/redux\/postSlice['"];?\n?/, '');
      content = content.replace(/import\s+\{\s*combineSlices\s*\}\s*from\s+['"]@reduxjs\/toolkit['"];?\n?/, '');
      content = content.replace(/,\s*useSelector\s*/, '');
      content = content.replace(/const\s+dispatch\s*=\s*useDispatch\(\);\s*\n/, ''); // remove unused dispatch
    }
    if (f.endsWith('CreatePost.jsx')) {
      content = content.replace(/const createPostHandler = async\(e\) => \{/, 'const createPostHandler = async() => {');
      if (!content.includes('import axios from "axios"')) {
          content = 'import axios from "axios";\n' + content;
      }
    }
    if (f.endsWith('dialog.jsx')) {
      content = content.replace(/showCloseButton = true,\s*\n/, '');
      content = content.replace(/showCloseButton = false,\s*\n/, '');
      content = content.replace(/\{showCloseButton && \([\s\S]*?\)\}\n/, '');
    }
    fs.writeFileSync(p, content, 'utf8');
  }
});
