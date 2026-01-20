import db from '../config/database';

export interface Hero {
  id?: number;
  background_image: string;
  title_cn: string;
  title_en: string;
  subtitle_cn: string;
  subtitle_en: string;
  cta_text_cn: string;
  cta_text_en: string;
  updated_at?: string;
}

export const getHero = (): Promise<Hero> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM hero LIMIT 1', (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Hero);
      }
    });
  });
};

export const updateHero = (data: Partial<Hero>): Promise<Hero> => {
  return new Promise((resolve, reject) => {
    const updates: string[] = [];
    const params: any[] = [];

    Object.keys(data).forEach((key) => {
      if (data[key as keyof Hero] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(data[key as keyof Hero]);
      }
    });

    if (updates.length === 0) {
      getHero().then(resolve).catch(reject);
      return;
    }

    params.push(new Date().toISOString());

    db.run(
      `UPDATE hero SET ${updates.join(', ')}, updated_at = ? WHERE id = 1`,
      params,
      (err) => {
        if (err) {
          reject(err);
        } else {
          getHero().then(resolve).catch(reject);
        }
      }
    );
  });
};
