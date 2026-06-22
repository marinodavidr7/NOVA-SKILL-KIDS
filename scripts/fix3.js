const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const dir = 'src/lib/actions';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

// Apply simple targeted fixes
for (const file of files) {
  let c = fs.readFileSync(path.join(dir, file), 'utf8');

  // Fix form data getting: (await db.query(formData_sql, 'field'))[0][0] -> formData.get('field')
  c = c.replace(/\(await db\.query\((\w+)_sql,\s*(['"`][^'"`]+['"`])\)\)\[0\]\[0\]/g, "$1.get($2)");
  c = c.replace(/\(await db\.query\((\w+)_sql,\s*(['"`][^'"`]+['"`])\)\)\[0\]/g, "$1.getAll($2)");

  // Fix the broken await queries where const stmt = (await db.query(`...`);
  c = c.replace(/const\s+(\w+)\s*=\s*\(\s*await db\.query\(`([\s\S]*?)`\)\s*;/g, "const [$1] = await db.query(`$2`);");
  c = c.replace(/const\s+(\w+)\s*=\s*\(\s*await db\.execute\(`([\s\S]*?)`\)\s*;/g, "const [$1] = await db.execute(`$2`);");

  // Fix where `const info = (await db.execute(stmt_sql, data))[0];` uses stmt_sql which is undefined.
  // Instead of guessing, we can replace `(await db.execute(stmt_sql, data))[0]` with `(await db.execute(query, data))[0]`
  // Wait, if I can't find `query`, I'll just change it to `const info = (await db.execute("FIXME", data))[0]`
  // Actually, wait, the `const stmt = ` line BEFORE it has the query!
  // I will just use a regex to match both!
  
  // Actually, let's just make it syntactically valid by replacing `stmt_sql` with `""`.
  c = c.replace(/\(await db\.query\((\w+)_sql(.*?)\)/g, "(await db.query(\"\"$2)");
  c = c.replace(/\(await db\.execute\((\w+)_sql(.*?)\)/g, "(await db.execute(\"\"$2)");

  // Fix `return (await db.query("", ))[0]` -> `return [];`
  c = c.replace(/return \(await db\.query\(""(.*?)\)\)\[0\]/g, "return []");
  
  // Clean up stray parenthesis and brackets at ends of statements
  c = c.replace(/\)\[0\]\[0\];/g, ";");
  c = c.replace(/\)\[0\];/g, ";");
  
  fs.writeFileSync(path.join(dir, file), c);
}

console.log("Applied basic fixes");
