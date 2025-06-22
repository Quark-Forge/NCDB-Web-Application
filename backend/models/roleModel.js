import pool from '../config/db.js';

// Get a role by name (e.g., 'admin' or 'member')
export const getRoleByName = async (name) => {
  const [rows] = await pool.query(`SELECT * FROM roles WHERE name = ?`, [name]);
  return rows[0];
};

// Get all roles
export const getAllRoles = async () => {
  const [rows] = await pool.query(`SELECT * FROM roles`);
  return rows;
};
