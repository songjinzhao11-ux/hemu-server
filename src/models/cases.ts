import db from '../config/database';

export interface CaseStudy {
  id?: number;
  title: string;
  category: string;
  image: string;
  location: string;
  year: string;
  description?: string;
  content?: string;
  gallery_images?: string; // JSON string array
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export const getAllCases = (): Promise<CaseStudy[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM cases ORDER BY order_index ASC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as CaseStudy[]);
      }
    });
  });
};

export const getCaseById = (id: number): Promise<CaseStudy | undefined> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM cases WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as CaseStudy | undefined);
      }
    });
  });
};

export const createCase = (data: Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>): Promise<CaseStudy> => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO cases (title, category, image, location, year, description, content, gallery_images, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.title, data.category, data.image, data.location, data.year, data.description || null, data.content || null, data.gallery_images || null, data.order_index],
      function (err) {
        if (err) {
          reject(err);
        } else {
          getCaseById(this.lastID).then((c) => {
            if (c) resolve(c);
            else reject(new Error('Failed to create case'));
          }).catch(reject);
        }
      }
    );
  });
};

export const updateCase = (id: number, data: Partial<Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>>): Promise<CaseStudy> => {
  return new Promise((resolve, reject) => {
    const updates: string[] = [];
    const params: any[] = [];

    (Object.keys(data) as (keyof Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>)[]).forEach((key) => {
      if (data[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(data[key]);
      }
    });

    if (updates.length > 0) {
      params.push(new Date().toISOString());
      params.push(id);
      db.run(
        `UPDATE cases SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`,
        params,
        (err) => {
          if (err) {
            reject(err);
          } else {
            getCaseById(id).then((c) => {
              if (c) resolve(c);
              else reject(new Error('Case not found'));
            }).catch(reject);
          }
        }
      );
    } else {
      getCaseById(id).then((c) => {
        if (c) resolve(c);
        else reject(new Error('Case not found'));
      }).catch(reject);
    }
  });
};

export const deleteCase = (id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM cases WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes > 0);
      }
    });
  });
};

export const reorderCases = (orders: { id: number; order_index: number }[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('UPDATE cases SET order_index = ? WHERE id = ?');
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
