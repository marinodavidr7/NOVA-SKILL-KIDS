const fs = require('fs');
const path = require('path');

const dir = 'src/lib/actions';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix 1: get / all
  content = content.replace(/const\s+(\w+)\s*=\s*\(await db\.(?:query|execute)\(`([\s\S]*?)`\);\s*return \(await db\.(?:query|execute)\(\w+_sql,\s*(.*?)\)\)\[0\](.*?;)/g, (match, p1, p2, p3, p4) => {
    let args = p3.trim();
    if (args === '') {
      return `const [${p1}] = await db.query(\`${p2}\`);\n  return ${p1}${p4}`;
    } else {
      // args might be missing array brackets if it was passed raw like `id`
      // But let's leave it as is, and we can fix manually or assume it's valid if we wrap it.
      return `const [${p1}] = await db.query(\`${p2}\`, ${args});\n  return ${p1}${p4}`;
    }
  });

  // Fix 2: create / insert
  content = content.replace(/const\s+(\w+)\s*=\s*\(await db\.(?:query|execute)\(`([\s\S]*?)`\);\s*const (\w+)\s*=\s*\(await db\.(?:query|execute)\(\w+_sql,\s*(.*?)\)\)\[0\];/g, (match, p1, p2, p3, p4) => {
    let args = p4.trim();
    return `const [${p3}] = await db.execute(\`${p2}\`, ${args});`;
  });

  // Fix 3: update
  content = content.replace(/const\s+(\w+)\s*=\s*\(await db\.(?:query|execute)\(`([\s\S]*?)`\);\s*\(await db\.(?:query|execute)\(\w+_sql,\s*(.*?)\)\)\[0\];/g, (match, p1, p2, p3) => {
    let args = p3.trim();
    return `await db.execute(\`${p2}\`, ${args});`;
  });

  // Fix 4: db.prepare inline
  // db.prepare(`DELETE FROM transport_vehicles WHERE id = ?`, id))[0];
  content = content.replace(/db\.prepare\(`([\s\S]*?)`,\s*(.*?)\)\)\[0\];/g, (match, p1, p2) => {
    // If p2 is not surrounded by [] and not an object, wrap it
    let args = p2;
    if (!args.startsWith('[') && !args.startsWith('{')) {
      args = `[${args}]`;
    }
    return `await db.execute(\`${p1}\`, ${args});`;
  });
  
  // db.prepare inline no args
  content = content.replace(/db\.prepare\(`([\s\S]*?)`\)\)\[0\];/g, (match, p1) => {
    return `await db.execute(\`${p1}\`);`;
  });
  
  // also get inline no args
  content = content.replace(/db\.prepare\(`([\s\S]*?)`\)\)\[0\]\[0\];/g, (match, p1) => {
    return `(await db.query(\`${p1}\`))[0][0];`;
  });

  // Re-fix some query/execute where I did `db.prepare(..).run(..)` directly.
  content = content.replace(/\(await db\.execute\(`([\s\S]*?)`,\s*(.*?)\)\)\[0\];/g, "await db.execute(`$1`, $2);");
  content = content.replace(/\(await db\.execute\(`([\s\S]*?)`\)\)\[0\];/g, "await db.execute(`$1`);");

  // Fix `return (await db.query(...))[0]` -> `const [rows] = await db.query(...); return rows;`
  content = content.replace(/return \(await db\.query\(`([\s\S]*?)`,\s*(.*?)\)\)\[0\](.*?;)/g, "const [rows] = await db.query(`$1`, $2);\n  return rows$3");
  content = content.replace(/return \(await db\.query\(`([\s\S]*?)`\)\)\[0\](.*?;)/g, "const [rows] = await db.query(`$1`);\n  return rows$2");

  fs.writeFileSync(filePath, content);
}
console.log("Fixes applied");
