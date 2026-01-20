import db from '../config/database';

export interface About {
  id?: number;
  image: string;
  title_cn: string;
  subtitle_cn: string;
  description_cn: string;
  description2_cn: string;
  projects_count: number;
  partners_count: number;
  updated_at?: string;
}

export const getAbout = (): Promise<About> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM about LIMIT 1', (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as About);
      }
    });
  });
};

export const updateAbout = (data: Partial<About>): Promise<About> => {
  return new Promise((resolve, reject) => {
    const updates: string[] = [];
    const params: any[] = [];

    Object.keys(data).forEach((key) => {
      if (data[key as keyof About] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(data[key as keyof About]);
      }
    });

    if (updates.length === 0) {
      getAbout().then(resolve).catch(reject);
      return;
    }

    params.push(new Date().toISOString());

    db.run(
      `UPDATE about SET ${updates.join(', ')}, updated_at = ? WHERE id = 1`,
      params,
      (err) => {
        if (err) {
          reject(err);
        } else {
          getAbout().then(resolve).catch(reject);
        }
      }
    );
  });
};
