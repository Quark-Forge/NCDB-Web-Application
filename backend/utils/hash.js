import bcrypt from 'bcryptjs';
import { promisify } from 'util';

const genSalt = promisify(bcrypt.genSalt);
const hash = promisify(bcrypt.hash);
const compare = promisify(bcrypt.compare);

const SALT_ROUNDS = 12;


export const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  try {
    const salt = await genSalt(SALT_ROUNDS);
    return await hash(password, salt);
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Password hashing failed');
  }
};

export const matchPassword = async (enteredPassword, storedHashedPassword) => {
  if (!enteredPassword || typeof enteredPassword !== 'string' ||
      !storedHashedPassword || typeof storedHashedPassword !== 'string') {
    throw new Error('Both passwords must be non-empty strings');
  }

  try {
    return await compare(enteredPassword, storedHashedPassword);
  } catch (error) {
    console.error('Password comparison failed:', error);
    throw new Error('Password comparison failed');
  }
};