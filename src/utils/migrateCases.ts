import db from '../config/database';

/**
 * 数据库迁移脚本 - 为 cases 表添加详情页字段
 * 
 * 添加以下字段：
 * - description: 项目概述
 * - content: 项目详情
 * - gallery_images: 项目图库 (JSON 格式)
 */

const migrateCasesTable = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('开始迁移 cases 表...');

    db.serialize(() => {
      // 检查是否已经有这些字段
      db.all("PRAGMA table_info(cases)", (err, columns: any[]) => {
        if (err) {
          console.error('检查表结构失败:', err);
          reject(err);
          return;
        }

        const existingColumns = columns.map(col => col.name);
        console.log('现有字段:', existingColumns);

        const fieldsToAdd = [];

        if (!existingColumns.includes('description')) {
          fieldsToAdd.push('description TEXT');
        }

        if (!existingColumns.includes('content')) {
          fieldsToAdd.push('content TEXT');
        }

        if (!existingColumns.includes('gallery_images')) {
          fieldsToAdd.push('gallery_images TEXT');
        }

        if (fieldsToAdd.length === 0) {
          console.log('✓ 所有字段已存在，无需迁移');
          resolve();
          return;
        }

        console.log('需要添加的字段:', fieldsToAdd);

        // 逐个添加字段
        let completed = 0;
        fieldsToAdd.forEach((field) => {
          const fieldName = field.split(' ')[0];
          const sql = `ALTER TABLE cases ADD COLUMN ${field}`;
          
          db.run(sql, (err) => {
            if (err) {
              console.error(`添加字段 ${fieldName} 失败:`, err);
              reject(err);
              return;
            }
            
            console.log(`✓ 字段 ${fieldName} 添加成功`);
            completed++;
            
            if (completed === fieldsToAdd.length) {
              console.log('✓ 所有字段添加完成！');
              resolve();
            }
          });
        });
      });
    });
  });
};

// 如果直接运行此脚本
if (require.main === module) {
  migrateCasesTable()
    .then(() => {
      console.log('\n✓ 数据库迁移成功完成！');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n✗ 数据库迁移失败:', err);
      process.exit(1);
    });
}

export default migrateCasesTable;
