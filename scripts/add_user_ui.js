const fs = require('fs');
let c = fs.readFileSync('src/app/settings/page.tsx', 'utf8');

if (!c.includes('import { getCurrentUser, updateUserProfile, createUserDirectly }')) {
  c = c.replace(
    'import { getCurrentUser, updateUserProfile } from "@/lib/actions/auth";',
    'import { getCurrentUser, updateUserProfile, createUserDirectly } from "@/lib/actions/auth";'
  );
}

if (!c.includes('const [isAddingUser, setIsAddingUser]')) {
  c = c.replace(
    'const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(false);',
    `const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', nombre: '', role: 'teacher' });
  const [isSavingUser, setIsSavingUser] = useState(false);
  
  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.nombre) return toast.error('Llena los campos requeridos');
    setIsSavingUser(true);
    try {
      const res = await createUserDirectly(newUser.username, newUser.password, newUser.nombre, newUser.role);
      if (res.success) {
        toast.success('Usuario creado exitosamente');
        setIsAddingUser(false);
        setNewUser({ username: '', password: '', nombre: '', role: 'teacher' });
        fetchUsuarios();
      } else {
        toast.error(res.error || 'Error al crear usuario');
      }
    } catch(e: any) {
      toast.error(e.message || 'Error');
    }
    setIsSavingUser(false);
  };`
  );
}

const headerTarget = `<CardTitle className="text-lg">Gestión de Usuarios y Accesos</CardTitle>
                <CardDescription>
                  Aquí puedes ver todas las cuentas con acceso al sistema. Los PINs de los maestros se generan en la sección de Personal.
                </CardDescription>
              </CardHeader>`;

const replacementHeader = `<CardTitle className="text-lg">Gestión de Usuarios y Accesos</CardTitle>
                <CardDescription>
                  Aquí puedes ver todas las cuentas con acceso al sistema. Los PINs de los maestros se generan en la sección de Personal.
                </CardDescription>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setIsAddingUser(!isAddingUser)} size="sm" variant={isAddingUser ? 'outline' : 'default'} className={!isAddingUser ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}>
                    {isAddingUser ? 'Cancelar' : 'Agregar Usuario'}
                  </Button>
                </div>
              </CardHeader>`;

if (!c.includes('setIsAddingUser(!isAddingUser)')) {
  c = c.replace(headerTarget, replacementHeader);
}

const formTarget = `{isLoadingUsuarios ? (`;
const formReplacement = `{isAddingUser && (
                  <div className="mb-6 p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl space-y-4 animate-in fade-in zoom-in-95">
                    <h3 className="font-semibold text-slate-800">Crear Nuevo Usuario</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre Completo</Label>
                        <Input value={newUser.nombre} onChange={e => setNewUser({...newUser, nombre: e.target.value})} placeholder="Ej. Juan Pérez" className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre de Usuario</Label>
                        <Input value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="usuario123" className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label>Contraseña</Label>
                        <Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="********" className="bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label>Rol del Sistema</Label>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={newUser.role}
                          onChange={e => setNewUser({...newUser, role: e.target.value})}
                        >
                          <option value="admin">Administrador (Acceso Total)</option>
                          <option value="teacher">Maestro (Acceso Limitado)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button onClick={handleCreateUser} disabled={isSavingUser} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                        {isSavingUser ? 'Guardando...' : 'Guardar Usuario'}
                      </Button>
                    </div>
                  </div>
                )}
                
                {isLoadingUsuarios ? (`

if (!c.includes('Crear Nuevo Usuario')) {
  c = c.replace(formTarget, formReplacement);
}

fs.writeFileSync('src/app/settings/page.tsx', c);
console.log('Done');
