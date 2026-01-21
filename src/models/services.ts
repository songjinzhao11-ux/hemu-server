import db from '../config/database';

export interface Service {
  id?: number;
  title_cn: string;
  title_en: string;
  description: string;
  icon_name: string;
  order_index: number;
  updated_at?: string;
}

export const getAllServices = (): Promise<Service[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM services ORDER BY order_index ASC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as Service[]);
      }
    });
  });
};

export const getServiceById = (id: number): Promise<Service | undefined> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM services WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Service | undefined);
      }
    });
  });
};

export const createService = (data: Omit<Service, 'id' | 'updated_at'>): Promise<Service> => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO services (title_cn, title_en, description, icon_name, order_index) VALUES (?, ?, ?, ?, ?)',
      [data.title_cn, data.title_en, data.description, data.icon_name, data.order_index],
      function (err) {
        if (err) {
          reject(err);
        } else {
          getServiceById(this.lastID).then((service) => {
            if (service) {
              resolve(service);
            } else {
              reject(new Error('Service not found after creation'));
            }
          }).catch(reject);
        }
      }
    );
  });
};

export const updateService = (id: number, data: Partial<Omit<Service, 'id' | 'updated_at'>>): Promise<Service> => {
  return new Promise((resolve, reject) => {
    const updates: string[] = [];
    const params: any[] = [];

    (Object.keys(data) as (keyof Omit<Service, 'id' | 'updated_at'>)[]).forEach((key) => {
      if (data[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(data[key]);
      }
    });

    if (updates.length > 0) {
      params.push(new Date().toISOString());
      params.push(id);
      db.run(
        `UPDATE services SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`,
        params,
        (err) => {
          if (err) {
            reject(err);
          } else {
            getServiceById(id).then((service) => {
              if (service) {
                resolve(service);
              } else {
                reject(new Error('Service not found after update'));
              }
            }).catch(reject);
          }
        }
      );
    } else {
      getServiceById(id).then((service) => {
        if (service) {
          resolve(service);
        } else {
          reject(new Error('Service not found'));
        }
      }).catch(reject);
    }
  });
};

export const deleteService = (id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM services WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes > 0);
      }
    });
  });
};

export const reorderServices = (orders: { id: number; order_index: number }[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('UPDATE services SET order_index = ? WHERE id = ?');
    const promises = orders.map((item) => {
      return new Promise<void>((res, rej) => {
        stmt.run([item.order_index, item.id], (err) => {
          if (err) rej(err);
          else res();
        });
      });
    });
    Promise.all(promises).then(() => resolve()).catch(reject);
    stmt.finalize();
  });
};
