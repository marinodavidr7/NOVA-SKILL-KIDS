const fs = require('fs');
const path = require('path');

const files = [
  'src/app/transport/vehicles/page.tsx',
  'src/app/transport/drivers/page.tsx',
  'src/app/transport/routes/page.tsx',
  'src/app/transport/assignments/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Ensure ArrowLeft is imported
  if (!content.includes('ArrowLeft')) {
    content = content.replace(/import {([^}]+)} from 'lucide-react';/, (match, p1) => {
      return `import {${p1}, ArrowLeft } from 'lucide-react';`;
    });
  }

  // Inject the back button
  const targetStr = `        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14`;
          
  const replacementStr = `        <div className="flex items-center gap-4">
          <Link href="/transport">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center justify-center w-14 h-14`;

  if (!content.includes('<ArrowLeft')) {
    content = content.replace(targetStr, replacementStr);
  }
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
