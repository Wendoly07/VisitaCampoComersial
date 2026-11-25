// Crea o actualiza un usuario con contraseña.
// Uso: npm run crear-usuario -- correo@empresa.com "Nombre Completo" "Clave123!" [rol] [usuario]
import bcrypt from 'bcryptjs';
import { q1, T, getPool } from '../db.js';

const [correo, nombre, clave, rol = 'visitador', usuario = null] = process.argv.slice(2);
if (!correo || !nombre || !clave) {
  console.log('Uso: npm run crear-usuario -- correo "Nombre" "Clave" [visitador|supervisor|admin] [usuario]');
  process.exit(1);
}
const hash = await bcrypt.hash(clave, 10);
const existe = await q1(`SELECT Id FROM ${T.Usuarios} WHERE Correo=@c`, { c: correo.toLowerCase() });
if (existe) {
  await q1(`UPDATE ${T.Usuarios} SET Nombre=@n, PasswordHash=@h, Rol=@r, Usuario=COALESCE(@u, Usuario), Activo=1 WHERE Id=@id`,
    { n: nombre, h: hash, r: rol, u: usuario, id: existe.id });
  console.log('Usuario actualizado:', correo);
} else {
  await q1(`INSERT INTO ${T.Usuarios} (Nombre, Correo, Usuario, PasswordHash, Rol) VALUES (@n, @c, @u, @h, @r)`,
    { n: nombre, c: correo.toLowerCase(), u: usuario, h: hash, r: rol });
  console.log('Usuario creado:', correo);
}
await (await getPool()).close();
