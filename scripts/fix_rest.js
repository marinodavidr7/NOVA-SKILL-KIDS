const fs = require('fs');

let c = fs.readFileSync('src/lib/initDb.ts', 'utf8');
c = c.replace(/db\.exec\(/g, 'await db.query(');
c = c.replace(/db\.prepare\((['"`])([\s\S]*?)\1\)\.get\(\)/g, '(await db.query($1$2$1))[0][0]');
c = c.replace(/db\.prepare\((['"`])([\s\S]*?)\1\)\.run\((.*?)\)/g, 'await db.execute($1$2$1, [$3])');
fs.writeFileSync('src/lib/initDb.ts', c);

// Fix route.ts
let p = 'src/app/api/nutrition/[id]/route.ts';
if (fs.existsSync(p)) {
  let routeContent = fs.readFileSync(p, 'utf8');
  routeContent = routeContent.replace(/db\.prepare\(`SELECT \* FROM nutrition_meals WHERE id = \?`\)\.get\(params\.id\)/g, '(await db.query(`SELECT * FROM nutrition_meals WHERE id = ?`, [params.id]))[0][0]');
  fs.writeFileSync(p, routeContent);
}

// Fix receipt page.tsx
p = 'src/app/staff/[id]/receipt/page.tsx';
if (fs.existsSync(p)) {
  let receiptContent = fs.readFileSync(p, 'utf8');
  receiptContent = receiptContent.replace(/db\.prepare\("SELECT \* FROM staff WHERE id = \?"\)\.get\(resolvedParams\.id\)/g, '(await db.query("SELECT * FROM staff WHERE id = ?", [resolvedParams.id]))[0][0]');
  receiptContent = receiptContent.replace(/db\.prepare\(`([\s\S]*?)`\)\.get\(resolvedParams\.id\)/g, '(await db.query(`$1`, [resolvedParams.id]))[0][0]');
  fs.writeFileSync(p, receiptContent);
}

// Fix DocumentListClient.tsx
p = 'src/components/documents/DocumentListClient.tsx';
if (fs.existsSync(p)) {
  let docContent = fs.readFileSync(p, 'utf8');
  docContent = docContent.replace(/setCategoryFilter\(null\)/g, 'setCategoryFilter("all")');
  docContent = docContent.replace(/setEntityFilter\(null\)/g, 'setEntityFilter("all")');
  fs.writeFileSync(p, docContent);
}

// Fix EntityDocumentsCard.tsx
p = 'src/components/documents/EntityDocumentsCard.tsx';
if (fs.existsSync(p)) {
  let entContent = fs.readFileSync(p, 'utf8');
  entContent = entContent.replace(/const newDocs = /g, 'const newDocs: any[] = ');
  fs.writeFileSync(p, entContent);
}

// Fix ParentReportsCard.tsx
p = 'src/components/parents/ParentReportsCard.tsx';
if (fs.existsSync(p)) {
  let parContent = fs.readFileSync(p, 'utf8');
  parContent = parContent.replace(/setFilterType\(null\)/g, 'setFilterType("all")');
  parContent = parContent.replace(/val: string/g, 'val: string | null');
  fs.writeFileSync(p, parContent);
}
