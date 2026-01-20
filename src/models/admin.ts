import db from '../config/database';
import bcrypt from 'bcryptjs';

export interface Admin {
  id?: number;
  username: string;
  password_hash: string;
  created_at?: string;
}

export const createAdmin = (username: string, password: string): Promise<Admin> => {
  return new Promise((resolve, reject) => {
    const password_hash = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [username, password_hash], function (err) {
      if (err) {
        reject(err);
      } else {
        getAdminById(this.lastID).then((admin) => {
          if (admin) resolve(admin);
          else reject(new Error('Failed to create admin'));
        }).catch(reject);
      }
    });
  });
};

export const getAdminById = (id: number): Promise<Admin | undefined> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM admins WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Admin | undefined);
      }
    });
  });
};

export const getAdminByUsername = (username: string): Promise<Admin | undefined> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM admins WHERE username = ?', [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Admin | undefined);
      }
    });
  });
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};
