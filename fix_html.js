const fs = require('fs');
const path = require('path');

const pagesDir = 'public/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

const newHeader = `<header style="text-align:center; padding: 24px 0; background-color: var(--card-bg); border-bottom: 1px solid rgba(0,0,0,0.05); margin-bottom: 32px;">
    <a href="../index.html">
      <img src="../assets/logo.png" alt="FinanFlex" height="48" style="margin: 0 auto; display: block;">
    </a>
  </header>`;

files.forEach(file => {
  let content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  const headerRegex = /<nav class="navbar" id="navbar">[\s\S]*?<\/nav>/;
  if (headerRegex.test(content)) {
    content = content.replace(headerRegex, newHeader);
    fs.writeFileSync(path.join(pagesDir, file), content, 'utf8');
    console.log('Fixed header in', file);
  }
});
