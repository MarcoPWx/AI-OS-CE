import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

describe('generate-sql-from-import', () => {
  const dataDir = path.resolve(__dirname, '../../data/cli_import');
  const catsPath = path.join(dataDir, 'categories.json');
  const qPath = path.join(dataDir, 'questions.json');
  const outSql = path.resolve(__dirname, '../../supabase/cli_import_seed.sql');
  const scriptPath = path.resolve(__dirname, '../../scripts/generate-sql-from-import.js');

  let prevSql: string | null = null;

  beforeAll(() => {
    // Backup existing out SQL if present
    if (fs.existsSync(outSql)) {
      prevSql = fs.readFileSync(outSql, 'utf8');
    }
    fs.mkdirSync(dataDir, { recursive: true });

    const categories = [
      {
        slug: 'backend',
        name: 'Backend',
        description: 'Backend concepts',
        icon: '📦',
        color: '#3b82f6',
      },
    ];

    const questions = [
      {
        id: 't1',
        category: 'backend',
        text: 'What is HTTP?',
        options: ['A protocol', 'A database'],
        correct_answer: 0,
        explanation: 'HTTP is the HyperText Transfer Protocol.',
        difficulty: 'easy',
      },
    ];

    fs.writeFileSync(catsPath, JSON.stringify(categories, null, 2));
    fs.writeFileSync(qPath, JSON.stringify(questions, null, 2));
  });

  afterAll(() => {
    // Clean data dir files
    try {
      fs.unlinkSync(catsPath);
    } catch {}
    try {
      fs.unlinkSync(qPath);
    } catch {}

    // Restore or remove generated SQL
    if (prevSql != null) {
      fs.writeFileSync(outSql, prevSql);
    } else {
      try {
        fs.unlinkSync(outSql);
      } catch {}
    }
  });

  it('produces SQL with category upsert and question insert', () => {
    const out = execFileSync('node', [scriptPath], { encoding: 'utf8' });
    expect(fs.existsSync(outSql)).toBe(true);
    const sql = fs.readFileSync(outSql, 'utf8');

    expect(sql).toMatch(/INSERT INTO question_categories/);
    expect(sql).toMatch(/jsonb_build_object\('slug','backend'\)/);
    expect(sql).toMatch(/INSERT INTO questions/);
    expect(sql).toMatch(/'What is HTTP\?'/);
    expect(sql).toMatch(/\['A protocol','A database'\]/);
  });
});
