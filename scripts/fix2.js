const fs = require('fs');
const files = fs.readdirSync('src/lib/actions').filter(f => f.endsWith('.ts'));
files.forEach(file => {
  let p = 'src/lib/actions/' + file;
  let c = fs.readFileSync(p, 'utf8');
  
  // Fix 1: db.prepare('...'))[0]; -> await db.execute('...');
  c = c.replace(/db\.prepare\((['"`])([\s\S]*?)\1(?:,\s*(.*?))?\)\)\[0\];/g, (m, q, query, args) => {
    return args ? `await db.execute(${q}${query}${q}, [${args}]);` : `await db.execute(${q}${query}${q});`;
  });

  // Fix 2: const [X] = await db.query(...); \n return (await db.query(X_sql, ))[0] as any[]; -> return X as any[];
  c = c.replace(/const\s+\[(\w+)\]\s*=\s*await db\.query\(([\s\S]*?)\);\s*return \(await db\.query\(\1_sql,\s*\)\)\[0\]/g, 'const [$1] = await db.query($2);\n  return $1');
  
  // Same but with args
  c = c.replace(/const\s+\[(\w+)\]\s*=\s*await db\.query\(([\s\S]*?)\);\s*return \(await db\.query\(\1_sql,\s*(.*?)\)\)\[0\]/g, 'const [$1] = await db.query($2, $3);\n  return $1');

  // Fix 3: const [X] = await db.query(...); \n const Y = (await db.execute(X_sql, args))[0]; -> const [Y] = await db.execute(..., args);
  c = c.replace(/const\s+\[(\w+)\]\s*=\s*await db\.query\(([\s\S]*?)\);\s*const\s+(\w+)\s*=\s*\(await db\.execute\(\1_sql,\s*(.*?)\)\)\[0\];/g, 'const [$3] = await db.execute($2, $4);');

  // Fix 4: const [X] = await db.query(...); \n (await db.execute(X_sql, args))[0]; -> await db.execute(..., args);
  c = c.replace(/const\s+\[(\w+)\]\s*=\s*await db\.query\(([\s\S]*?)\);\s*\(await db\.execute\(\1_sql,\s*(.*?)\)\)\[0\];/g, 'await db.execute($2, $3);');

  // Fix 5: (await db.execute(...))[0]; -> await db.execute(...);
  c = c.replace(/^\s*\(\s*await db\.execute\((.*?)\)\s*\)\[0\];/gm, '  await db.execute($1);');
  
  // Fix 6: const X = (await db.query(...))[0][0]; -> const [[X]] = await db.query(...);
  c = c.replace(/const\s+(\w+)\s*=\s*\(await db\.query\((.*?)\)\)\[0\]\[0\];/g, 'const [[$1]] = await db.query($2);');
  
  // Fix 7: return (await db.query(...))[0][0]; -> const [[row]] = await db.query(...); return row;
  c = c.replace(/return\s+\(await db\.query\((.*?)\)\)\[0\]\[0\];/g, 'const [[row]] = await db.query($1);\n  return row;');

  // Fix 8: db.prepare('...').run(...) -> await db.execute('...', [...])
  c = c.replace(/db\.prepare\((['"`])([\s\S]*?)\1\)\.run\((.*?)\)/g, 'await db.execute($1$2$1, [$3])');

  // Fix 9: (await db.query(X, ))[0] -> (await db.query(X))[0]
  c = c.replace(/\(await db\.query\((.*?),\s*\)\)\[0\]/g, '(await db.query($1))[0]');

  // Fix 10: db.prepare(`...`, id))[0];
  c = c.replace(/db\.prepare\(`([\s\S]*?)`,\s*(.*?)\)\)\[0\];/g, "await db.execute(`$1`, [$2]);");

  fs.writeFileSync(p, c);
});
console.log('Done');
