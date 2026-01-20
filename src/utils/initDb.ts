import db from '../config/database';

const initDb = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Initializing database...');

    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS hero (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          background_image TEXT NOT NULL DEFAULT '../assets/images/fullscreen.png',
          title_cn TEXT NOT NULL DEFAULT 'HEMU',
          title_en TEXT DEFAULT '',
          subtitle_cn TEXT NOT NULL DEFAULT '探索美学与商业的无限可能',
          subtitle_en TEXT DEFAULT 'Exploring the infinite possibilities of aesthetics and commerce',
          cta_text_cn TEXT NOT NULL DEFAULT 'WHO WE ARE',
          cta_text_en TEXT DEFAULT '',
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS about (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          image TEXT NOT NULL DEFAULT '../assets/images/whoweare.jpg',
          title_cn TEXT NOT NULL DEFAULT '禾木',
          subtitle_cn TEXT NOT NULL DEFAULT '生长于城市缝隙的创意力量',
          description_cn TEXT NOT NULL DEFAULT 'HEMU位于成都，是专注城市及品牌公关活动的创意策划及统筹执行团队。着眼品牌长期价值，善于在地文化、艺术及跨地域资源整合，具有丰富的创意活动策划落地经验，将品牌及产品营销策略转化为"线上+线下"整合传播内容，赋能品牌价值新增量。',
          description2_cn TEXT NOT NULL DEFAULT '秉持原创精神，以"品效合一"为理念，链接年轻人的"创意"与"生意"，探索美学与商业的无限可能。',
          projects_count INTEGER DEFAULT 100,
          partners_count INTEGER DEFAULT 50,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title_cn TEXT NOT NULL,
          title_en TEXT NOT NULL,
          description TEXT NOT NULL,
          icon_name TEXT NOT NULL,
          order_index INTEGER DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS process_steps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          number TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          order_index INTEGER DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS cases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          image TEXT NOT NULL,
          location TEXT NOT NULL,
          year TEXT NOT NULL,
          order_index INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }

        db.get('SELECT COUNT(*) as count FROM hero', (err, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          if (row.count === 0) {
            db.prepare(`
              INSERT INTO hero (background_image, title_cn, subtitle_cn, cta_text_cn)
              VALUES ('../assets/images/fullscreen.png', 'HEMU', '探索美学与商业的无限可能', 'WHO WE ARE')
            `).run();
          }

          db.get('SELECT COUNT(*) as count FROM about', (err, row: any) => {
            if (err) {
              reject(err);
              return;
            }
            if (row.count === 0) {
              db.prepare(`
                INSERT INTO about (image, title_cn, subtitle_cn, description_cn, description2_cn, projects_count, partners_count)
                VALUES ('../assets/images/whoweare.jpg', '禾木', '生长于城市缝隙的创意力量',
                  'HEMU位于成都，是专注城市及品牌公关活动的创意策划及统筹执行团队。着眼品牌长期价值，善于在地文化、艺术及跨地域资源整合，具有丰富的创意活动策划落地经验，将品牌及产品营销策略转化为"线上+线下"整合传播内容，赋能品牌价值新增量。',
                  '秉持原创精神，以"品效合一"为理念，链接年轻人的"创意"与"生意"，探索美学与商业的无限可能。', 100, 50)
              `).run();
            }

            const services = [
              { title_cn: '城市文旅', title_en: 'City Culture & Tourism', description: '挖掘城市文化内核，打造具有地标意义的文旅IP。包括城市节庆策划、文创产品开发、旅游线路规划等。', icon_name: 'Layers', order_index: 0 },
              { title_cn: '会务统筹', title_en: 'Public Relations & Events', description: '提供全方位的活动策划与执行服务。商务会议、新品发布会、时尚秀场、企业年会等一站式解决方案。', icon_name: 'TrendingUp', order_index: 1 },
              { title_cn: '品牌策划', title_en: 'Brand Strategy & Design', description: '为品牌提供从0到1的孵化与升级。品牌定位、VI视觉识别系统设计、营销策略制定、空间SI设计。', icon_name: 'Lightbulb', order_index: 2 }
            ];

            db.get('SELECT COUNT(*) as count FROM services', (err, row: any) => {
              if (err) {
                reject(err);
                return;
              }
              if (row.count === 0) {
                const stmt = db.prepare('INSERT INTO services (title_cn, title_en, description, icon_name, order_index) VALUES (?, ?, ?, ?, ?)');
                for (const service of services) {
                  stmt.run(service.title_cn, service.title_en, service.description, service.icon_name, service.order_index);
                }
                stmt.finalize();
              }

              const steps = [
                { number: '01', title: '需求洞察', description: '深入沟通，精准定位核心诉求', order_index: 0 },
                { number: '02', title: '策略规划', description: '定制化创意方案与执行路径', order_index: 1 },
                { number: '03', title: '设计执行', description: '高标准视觉呈现与落地控场', order_index: 2 },
                { number: '04', title: '复盘交付', description: '项目效果评估与持续优化', order_index: 3 }
              ];

              db.get('SELECT COUNT(*) as count FROM process_steps', (err, row: any) => {
                if (err) {
                  reject(err);
                  return;
                }
                if (row.count === 0) {
                  const stmt = db.prepare('INSERT INTO process_steps (number, title, description, order_index) VALUES (?, ?, ?, ?)');
                  for (const step of steps) {
                    stmt.run(step.number, step.title, step.description, step.order_index);
                  }
                  stmt.finalize();
                }

                const cases = [
                  { title: '成渝地区双城经济', category: 'Event / PR', image: '../assets/images/chengyu.png', location: 'Chengdu, China', year: '2024', order_index: 0 },
                  { title: '人工影响天气技术交流会', category: 'Exhibition', image: '../assets/images/rengong.png', location: 'Chengdu, China', year: '2024', order_index: 1 },
                  { title: '生活垃圾分类宣传周', category: 'Stage Design', image: '../assets/images/fenlei.png', location: 'Chengdu, China', year: '2024', order_index: 2 },
                  { title: 'LOOPY赞萌露比', category: 'Brand Strategy', image: '../assets/images/looby.png', location: 'Chengdu, China', year: '2025', order_index: 3 },
                  { title: 'IFS-国庆限定市集', category: 'Culture & Tourism', image: '../assets/images/ifs.png', location: 'Chengdu, China', year: '2025', order_index: 4 },
                  { title: '宇宙尽头的派对', category: 'Party', image: '../assets/images/universal.png', location: 'Chengdu, China', year: '2025', order_index: 5 }
                ];

                db.get('SELECT COUNT(*) as count FROM cases', (err, row: any) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  if (row.count === 0) {
                    const stmt = db.prepare('INSERT INTO cases (title, category, image, location, year, order_index) VALUES (?, ?, ?, ?, ?, ?)');
                    for (const c of cases) {
                      stmt.run(c.title, c.category, c.image, c.location, c.year, c.order_index);
                    }
                    stmt.finalize();
                  }

                  console.log('Database initialized successfully!');
                  console.log('Default admin user will need to be created manually via API');
                  resolve();
                });
              });
            });
          });
        });
      });
    });
  });
};

if (require.main === module) {
  initDb().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Error initializing database:', err);
    process.exit(1);
  });
}

export default initDb;
