const fs = require('fs');
const path = require('path');

const dir = 'src/lib/actions';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');

  // REVERT: (await db.query(formData_sql, 'xxx'))[0][0] -> formData.get('xxx')
  // We matched (\w+)\.get\((.*?)\) and replaced with (await db.query($1_sql, $2))[0][0]
  content = content.replace(/\(await db\.query\((\w+)_sql,\s*(.*?)\)\)\[0\]\[0\]/g, '$1.get($2)');

  // REVERT: (await db.query(formData_sql, 'xxx'))[0] -> formData.getAll('xxx') or just formData.all('xxx') if that was what it was?
  // Wait, formData doesn't have .all(). It has .getAll(). But if it was .all(), it means the original code had formData.all()? No, formData.getAll() wasn't matched. formData.get() was.
  // What else has .all()? maybe some other object. Let's revert .all() too
  content = content.replace(/\(await db\.query\((\w+)_sql,\s*(.*?)\)\)\[0\]/g, '$1.all($2)');
  
  // Wait, if it WAS actually a database statement, like stmt.all()?
  // If it was a database statement, I had changed `const stmt = db.prepare(...)` to `const stmt_sql = ...`.
  // Did I? No, I ran another script that changed `stmt_sql` back to `stmt`? No, I didn't.
  // Wait, in my first script:
  // content = content.replace(/const\s+(\w+)\s*=\s*db\.prepare\(([\s\S]*?)\);/g, 'const $1_sql = $2;');
  // So if it was `stmt`, it became `stmt_sql`.
  // Then `stmt.get(args)` became `(await db.query(stmt_sql, args))[0][0]`.
  // So if $1 is `stmt` or `info` or something related to db, we SHOULD NOT revert it to `.get()`.
  // We should ONLY revert if $1 is `formData` or `data` or `searchParams`.
  
  content = content.replace(/\(await db\.query\((formData|data|searchParams|url)_sql,\s*(.*?)\)\)\[0\]\[0\]/g, '$1.get($2)');
  content = content.replace(/\(await db\.query\((formData|data|searchParams|url)_sql,\s*(.*?)\)\)\[0\]/g, '$1.all($2)'); // or get?

  fs.writeFileSync(path.join(dir, file), content);
}
console.log('Reverts applied.');
