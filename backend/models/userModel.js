import pool from '../config/db.js';

export const createUser = async ({ name, email, password}) => {
  const defaultRole = 2;
  const sql = `INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)`;
  const [result] = await pool.query(sql, [name, email, password, defaultRole]);

  return result;
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

export const updateUser = async (id, { name, email, password }) => {
  
  const sql = `
    UPDATE users 
    SET name = ?, email = ?, password = ?
    WHERE id = ?
  `;
  const [result] = await pool.query(sql, [
    name,
    email,
    password,
    id,
  ]);

  return result;
};


