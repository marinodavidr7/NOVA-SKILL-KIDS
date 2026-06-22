const fs = require('fs');
let c = fs.readFileSync('src/app/login/page.tsx', 'utf8');

c = c.replace(
  "const [inputValue, setInputValue] = useState('');",
  "const [inputValue, setInputValue] = useState('');\n  const [isManualAdmin, setIsManualAdmin] = useState(false);\n  const [adminUsername, setAdminUsername] = useState('');"
);

c = c.replace(
  "if (!inputValue || !selectedUser) return;",
  "if (!inputValue || (!selectedUser && !isManualAdmin)) return;\n    if (isManualAdmin && !adminUsername) return;"
);

c = c.replace(
  "? await loginWithPin(selectedUser.username, inputValue)",
  "? await loginWithPin(isManualAdmin ? adminUsername : selectedUser?.username || '', inputValue)"
);

c = c.replace(
  ": await loginWithPassword(selectedUser.username, inputValue);",
  ": await loginWithPassword(isManualAdmin ? adminUsername : selectedUser?.username || '', inputValue);"
);

c = c.replace(
  "{!selectedUser && (",
  "{!selectedUser && !isManualAdmin && ("
);

// Add the "Ingreso Manual" button at the end of the user list
c = c.replace(
  /<\/div>\s*\}\s*\)\}\s*<\/div>\s*\)\}\s*<\/div>\s*\)\}/g,
  `</div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
              <button 
                onClick={() => setIsManualAdmin(true)} 
                className="text-white/40 hover:text-white/80 text-xs font-medium tracking-wider uppercase transition-colors"
              >
                Acceso Administrador
              </button>
            </div>
          </div>
        )}`
);

const manualUi = `
        {/* ── STEP: Manual Admin Login ── */}
        {isManualAdmin && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <h1 className="text-2xl font-semibold text-white tracking-tight text-center drop-shadow-md mb-6">
              Administración
            </h1>
            <form className="w-full relative" onSubmit={handleLogin}>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Usuario"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full h-12 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/40 text-center text-lg backdrop-blur-md focus:bg-white/20 focus:ring-2 focus:ring-white/30 transition-all"
                  autoFocus
                />
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); setError(''); }}
                    className={\`w-full h-12 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/40 text-center text-lg tracking-[0.2em] backdrop-blur-md focus:bg-white/20 focus:ring-2 focus:ring-white/30 transition-all \${error ? 'border-red-500/50 focus:ring-red-500/30' : ''}\`}
                  />
                  <Button
                    type="submit"
                    disabled={!inputValue || !adminUsername || isLoading}
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10 rounded-full bg-transparent hover:bg-white/20 text-white transition-colors"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </form>
            {error && (
              <div className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center animate-in slide-in-from-bottom-2">
                {error}
              </div>
            )}
            <button 
              onClick={() => { setIsManualAdmin(false); setInputValue(''); setAdminUsername(''); setError(''); }} 
              className="mt-8 text-white/60 hover:text-white text-sm"
            >
              Volver a la lista
            </button>
          </div>
        )}
`;

c = c.replace(
  "{/* ── STEP 2: Password / PIN entry ── */}",
  manualUi + "\n\n        {/* ── STEP 2: Password / PIN entry ── */}"
);

fs.writeFileSync('src/app/login/page.tsx', c);
console.log('Patch complete.');
