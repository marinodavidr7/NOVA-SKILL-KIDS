'use server';

import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { hashPassword, verifyPassword } from '@/lib/authUtils';
import { RowDataPacket } from 'mysql2';

export interface AuthUser {
  id: number;
  username: string;
  role: string;
  staffId?: number | null;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  email?: string | null;
  title?: string | null;
  hasPin?: boolean;
  permissions?: {
    assignChild?: boolean;
    removeChild?: boolean;
    createClassroom?: boolean;
    editClassroom?: boolean;
    deleteClassroom?: boolean;
    registerChild?: boolean;
    planMenu?: boolean;
    viewIncome?: boolean;
  } | null;
}

export async function loginWithPassword(username: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM users WHERE username = :username`, { username });
    const userRow = rows[0] as any;

    if (!userRow || !verifyPassword(password, userRow.password)) {
      return { success: false, error: 'Credenciales incorrectas' };
    }

    // Auto-migrate plain text password to secure hash
    if (!userRow.password.includes(':')) {
      const hashedPassword = hashPassword(password);
      await db.execute(`UPDATE users SET password = :hashedPassword WHERE id = :id`, { hashedPassword, id: userRow.id });
    }

    return await createSession(userRow);
  } catch (error) {
    console.error('Login Password Error:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

export async function loginWithPin(username: string, pin: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM users WHERE username = :username AND pin = :pin`, { username, pin });
    const userRow = rows[0] as any;

    if (!userRow) {
      return { success: false, error: 'PIN incorrecto' };
    }

    return await createSession(userRow);
  } catch (error) {
    console.error('Login PIN Error:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

// Helper para crear sesión
async function createSession(userRow: any) {
  const user: AuthUser = {
    id: userRow.id,
    username: userRow.username,
    role: userRow.role,
    staffId: userRow.staffId,
    hasPin: !!userRow.pin,
    firstName: userRow.firstName || undefined,
    lastName: userRow.lastName || undefined,
    avatar: userRow.avatar || undefined,
    email: userRow.email || undefined,
    title: userRow.title || undefined,
  };

  if (userRow.staffId) {
    const [staffRows] = await db.query<RowDataPacket[]>(`SELECT firstName, lastName, email FROM staff WHERE id = :staffId`, { staffId: userRow.staffId });
    const staffRow = staffRows[0] as any;
    if (staffRow) {
      if (!user.firstName) user.firstName = staffRow.firstName;
      if (!user.lastName) user.lastName = staffRow.lastName;
      if (!user.email) user.email = staffRow.email;
      if (!user.avatar) {
        user.avatar = `https://ui-avatars.com/api/?name=${staffRow.firstName}+${staffRow.lastName}&background=random`;
      }
    }
  }

  // Fallback: use username as display name if no real name is stored
  if (!user.firstName) {
    user.firstName = user.username;
  }

  const cookieStore = await cookies();
  cookieStore.set('auth_session', String(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  // Serialize cleanly — replace undefined with null so Next.js can serialize the response
  const serializedUser: AuthUser = {
    id: user.id,
    username: user.username,
    role: user.role,
    staffId: user.staffId ?? null,
    hasPin: user.hasPin ?? false,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    avatar: user.avatar ?? null,
    email: user.email ?? null,
    title: user.title ?? null,
    permissions: user.permissions ?? null,
  };

  return { success: true, user: serializedUser };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_session');
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('auth_session')?.value;

  if (!sessionId) {
    return null;
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM users WHERE id = :sessionId`, { sessionId });
    const userRow = rows[0] as any;
    
    if (!userRow) return null;

    const user: AuthUser = {
      id: userRow.id,
      username: userRow.username,
      role: userRow.role,
      staffId: userRow.staffId,
      hasPin: !!userRow.pin,
      firstName: userRow.firstName || undefined,
      lastName: userRow.lastName || undefined,
      avatar: userRow.avatar || undefined,
      email: userRow.email || undefined,
      title: userRow.title || undefined,
      permissions: userRow.permissions ? JSON.parse(userRow.permissions) : {}
    };

    if (userRow.staffId) {
      const [staffRows] = await db.query<RowDataPacket[]>(`SELECT firstName, lastName, email FROM staff WHERE id = :staffId`, { staffId: userRow.staffId });
      const staffRow = staffRows[0] as any;
      if (staffRow) {
        if (!user.firstName) user.firstName = staffRow.firstName;
        if (!user.lastName) user.lastName = staffRow.lastName;
        if (!user.email) user.email = staffRow.email;
        if (!user.avatar) {
          user.avatar = `https://ui-avatars.com/api/?name=${staffRow.firstName}+${staffRow.lastName}&background=random`;
        }
      }
    }

    // Fallback: use username as display name if no real name is stored
    if (!user.firstName) {
      user.firstName = user.username;
    }

    return user;
  } catch (error) {
    console.error('GetCurrentUser Error:', error);
    return null;
  }
}

export async function getUsersForSwitcher() {
  try {
    const [users] = await db.query<RowDataPacket[]>(`
      SELECT 
        u.id, u.username, u.role, u.staffId, u.pin, u.permissions,
        u.firstName as userFirstName, u.lastName as userLastName, u.avatar as userAvatar, u.email as userEmail, u.title as userTitle,
        s.firstName as staffFirstName, s.lastName as staffLastName
      FROM users u
      LEFT JOIN staff s ON u.staffId = s.id
      ORDER BY u.role = 'admin' DESC, u.firstName ASC
    `);

    return users.map(u => {
      const firstName = u.userFirstName || (u.staffId ? u.staffFirstName : u.username);
      const lastName = u.userLastName || (u.staffId ? u.staffLastName : '');
      const avatar = u.userAvatar || (u.staffId 
        ? `https://ui-avatars.com/api/?name=${u.staffFirstName}+${u.staffLastName}&background=random` 
        : '');
      return {
        id: u.id,
        username: u.username,
        role: u.role,
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        avatar,
        hasPin: !!u.pin,
        permissions: u.permissions ? JSON.parse(u.permissions) : {}
      };
    });
  } catch (error) {
    console.error('GetUsers Error:', error);
    return [];
  }
}

export async function createUserDirectly(username: string, passwordText: string, name: string, role: string, title: string = '') {
  try {
    const [existing] = await db.query<RowDataPacket[]>(`SELECT id FROM users WHERE username = :username`, { username });
    if (existing.length > 0) {
      return { success: false, error: 'El usuario ya existe' };
    }

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ');

    await db.execute(`
      INSERT INTO users (username, password, role, firstName, lastName, title) 
      VALUES (:username, :password, :role, :firstName, :lastName, :title)
    `, { 
      username, 
      password: passwordText, // It will be auto-migrated on first login
      role,
      firstName,
      lastName,
      title
    });
    return { success: true };
  } catch (error: any) {
    console.error('Create User Direct Error:', error);
    return { success: false, error: error.message || 'Error interno' };
  }
}

export async function createAccountForStaff(staffId: number, password: string, role: string = 'teacher', customUsername?: string) {
  try {
    const [staffRows] = await db.query<RowDataPacket[]>(`SELECT firstName, lastName, email FROM staff WHERE id = :staffId`, { staffId });
    const staffRow = staffRows[0] as any;
    if (!staffRow) return { success: false, error: 'Empleado no encontrado' };

    const username = customUsername || staffRow.email || `${staffRow.firstName.toLowerCase()}.${staffRow.lastName.toLowerCase()}`.replace(/\s+/g, '');

    const [existsRows] = await db.query<RowDataPacket[]>(`SELECT id FROM users WHERE staffId = :staffId`, { staffId });
    const exists = existsRows[0] as any;
    
    const hashedPassword = hashPassword(password);

    if (exists) {
      await db.execute(`UPDATE users SET username = :username, password = :hashedPassword, role = :role WHERE id = :id`, { username, hashedPassword, role, id: exists.id });
    } else {
      await db.execute(`
        INSERT INTO users (staffId, username, password, role) 
        VALUES (:staffId, :username, :hashedPassword, :role)
      `, { staffId, username, hashedPassword, role });
    }

    return { success: true, username };
  } catch (error: any) {
    console.error('CreateAccount Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Ya existe un usuario con ese nombre.' };
    }
    return { success: false, error: 'Error al crear cuenta' };
  }
}

export async function setupUserPin(pin: string) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auth_session')?.value;
    if (!sessionId) return { success: false, error: 'No autorizado' };

    await db.execute(`UPDATE users SET pin = :pin WHERE id = :sessionId`, { pin, sessionId });
    return { success: true };
  } catch (error) {
    console.error('Setup PIN Error:', error);
    return { success: false, error: 'Error al configurar PIN' };
  }
}

export async function updateUserPermissions(userId: number, permissions: Record<string, boolean>) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: 'No autorizado' };
    }

    await db.execute(`UPDATE users SET permissions = :permissions WHERE id = :userId`, { permissions: JSON.stringify(permissions), userId });
    return { success: true };
  } catch (error) {
    console.error('Update Permissions Error:', error);
    return { success: false, error: 'Error al actualizar permisos' };
  }
}

export async function updateUserProfile(data: {
  nombre: string;
  cargo: string;
  correo: string;
  foto?: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'No autorizado' };
    }

    // Split name into firstName and lastName
    const nameParts = data.nombre.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ');

    await db.execute(`
      UPDATE users 
      SET 
        firstName = :firstName, 
        lastName = :lastName, 
        email = :email, 
        avatar = :avatar, 
        title = :title
      WHERE id = :id
    `, { firstName, lastName, email: data.correo, avatar: data.foto || null, title: data.cargo, id: currentUser.id });

    // Sincronizar con staff si tiene staffId
    if (currentUser.staffId) {
      await db.execute(`
        UPDATE staff 
        SET 
          firstName = :firstName, 
          lastName = :lastName, 
          email = :email
        WHERE id = :staffId
      `, { firstName, lastName, email: data.correo, staffId: currentUser.staffId });
    }

    return { success: true };
  } catch (error) {
    console.error('Update User Profile Error:', error);
    return { success: false, error: 'Error al actualizar el perfil en la base de datos' };
  }
}
