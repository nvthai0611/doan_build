import * as fs from 'fs';
import * as path from 'path';

function listBackups() {
  const backupDir = path.join(__dirname, '..', 'backups');
  
  if (!fs.existsSync(backupDir)) {
    console.log('📁 Không tìm thấy thư mục backups');
    return;
  }

  const files = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log('📭 Không có file backup nào');
    return;
  }

  console.log('📦 Danh sách backups:\n');

  files.forEach((file, index) => {
    const filepath = path.join(backupDir, file);
    const stats = fs.statSync(filepath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    // Read backup info
    const content = fs.readFileSync(filepath, 'utf-8');
    const backup = JSON.parse(content);
    
    const tableCount = Object.keys(backup.data).length;
    const recordCounts = Object.entries(backup.data)
      .map(([key, value]: [string, any]) => `${key}: ${value.length}`)
      .join(', ');

    console.log(`${index + 1}. ${file}`);
    console.log(`   📅 Timestamp: ${backup.timestamp}`);
    console.log(`   💾 Size: ${sizeInMB} MB`);
    console.log(`   📊 Tables: ${tableCount}`);
    console.log(`   📝 Records: ${recordCounts}`);
    console.log(`   📂 Path: ${filepath}`);
    console.log('');
  });

  console.log('\n💡 Để restore backup, chạy:');
  console.log(`   npx ts-node scripts/restore-data.ts`);
  console.log(`   hoặc`);
  console.log(`   npx ts-node scripts/restore-data.ts backups/${files[0]}`);
}

listBackups();

