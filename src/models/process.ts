import db from '../config/database';

export interface ProcessStep {
  id?: number;
  number: string;
  title: string;
  description: string;
  order_index: number;
  updated_at?: string;
}

export const getAllProcessSteps = (): Promise<ProcessStep[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM process_steps ORDER BY order_index ASC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as ProcessStep[]);
      }
    });
  });
};

export const getProcessStepById = (id: number): Promise<ProcessStep | undefined> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM process_steps WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as ProcessStep | undefined);
      }
    });
  });
};

export const createProcessStep = (data: Omit<ProcessStep, 'id' | 'updated_at'>): Promise<ProcessStep> => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO process_steps (number, title, description, order_index) VALUES (?, ?, ?, ?)',
      [data.number, data.title, data.description, data.order_index],
      function (err) {
        if (err) {
          reject(err);
        } else {
          getProcessStepById(this.lastID).then((step) => {
            if (step) resolve(step);
            else reject(new Error('Failed to create process step'));
          }).catch(reject);
        }
      }
    );
  });
};

export const updateProcessStep = (id: number, data: Partial<Omit<ProcessStep, 'id' | 'updated_at'>>): Promise<ProcessStep> => {
  return new Promise((resolve, reject) => {
    const updates: string[] = [];
    const params: any[] = [];

    (Object.keys(data) as (keyof Omit<ProcessStep, 'id' | 'updated_at'>)[]).forEach((key) => {
      if (data[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(data[key]);
      }
    });

    if (updates.length > 0) {
      params.push(new Date().toISOString());
      params.push(id);
      db.run(
        `UPDATE process_steps SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`,
        params,
        (err) => {
          if (err) {
            reject(err);
          } else {
            getProcessStepById(id).then((step) => {
              if (step) resolve(step);
              else reject(new Error('Process step not found'));
            }).catch(reject);
          }
        }
      );
    } else {
      getProcessStepById(id).then((step) => {
        if (step) resolve(step);
        else reject(new Error('Process step not found'));
      }).catch(reject);
    }
  });
};

export const deleteProcessStep = (id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM process_steps WHERE id = ?', [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes > 0);
      }
    });
  });
};

export const reorderProcessSteps = (orders: { id: number; order_index: number }[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('UPDATE process_steps SET order_index = ? WHERE id = ?');
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
