import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string, callback: (filepath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('./src', (filepath) => {
  if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
    let content = fs.readFileSync(filepath, 'utf-8');
    let original = content;
    
    // Exact replacements
    content = content.replace(/ESTANCIA INFANTIL/g, 'NOVA SKILL KIDS');
    content = content.replace(/Estancia Infantil/g, 'Nova Skill Kids');
    content = content.replace(/la estancia/g, 'Nova Skill Kids');
    content = content.replace(/la Estancia/g, 'Nova Skill Kids');
    
    if (content !== original) {
      fs.writeFileSync(filepath, content);
      console.log(`Updated ${filepath}`);
    }
  }
});
