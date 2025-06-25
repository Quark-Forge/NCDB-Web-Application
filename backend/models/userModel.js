import pool from '../config/db.js';

export const createUser = async ({ name, email, contact_number, address, password, role}) => {
  const roleRow = await getRoleId(role);
  const role_id = roleRow?.id; 
  const sql = `INSERT INTO users (name, email, contact_number, address, password, role_id) VALUES (?, ?, ?, ?, ?, ?)`;
  const [result] = await pool.query(sql, [name, email, contact_number, address, password, role_id]);

  return result;
};
export const getRoleId = async (role) => {
  const [rows] = await pool.query(`
    SELECT id FROM roles WHERE name = ?`, [role]);
  if (rows.length === 0) {
    throw new Error(`Role '${role}' not found`);
  }
  return rows[0];
};


export const getUserByEmail = async (email) => {
  const [rows] = await pool.query(`
    SELECT users.*, roles.name AS role
    FROM users
    LEFT JOIN roles ON users.role_id = roles.id
    WHERE users.email = ?`, [email]);

  return rows[0];
};

export const getUser = async (userId) => {
  const [rows] = await pool.query(`
    SELECT users.*, roles.name AS role
    FROM users
    LEFT JOIN roles ON users.role_id = roles.id
    WHERE users.id = ?`, [userId]);

  return rows[0];
};

export const getAllUsers = async () => {
  const [rows] = await pool.query(`
    SELECT 
      users.id, 
      users.name, 
      users.email, 
      users.contact_number,
      users.address,
      roles.name AS role
    FROM users
    LEFT JOIN roles ON users.role_id = roles.id
  `);
  return rows;
};

export const updateUser = async (id, { name, email, contact_number, address, password }) => {
  
  const sql = `
    UPDATE users 
    SET name = ?, email = ?, contact_number = ?, address = ?, password = ?
    WHERE id = ?
  `;
  const [result] = await pool.query(sql, [
    name,
    email,
    contact_number,
    address,
    password,
    id,
  ]);

  return result;
};


