import fs from 'fs';
import path from 'path';

describe('CLI Importer (devmentor -> JSON)', () => {
  const importerPath = path.resolve(__dirname, '../../scripts/cli-import.js');
  const { importAll } = require(importerPath);

  it('generates a dataset with sane values (skipped if source missing)', () => {
    const src = path.resolve(__dirname, '../../../devmentor/quiz-system');
    if (!fs.existsSync(src)) {
      console.warn('DevMentor source not found, skipping import test');
      return;
    }
    const result = importAll({ writeFiles: false });
    expect(result.stats.total_questions).toBeGreaterThan(500);
    expect(result.categories.length).toBeGreaterThan(5);

    const sample = result.questions[0];
    expect(sample.text.length).toBeGreaterThan(10);
    expect(Array.isArray(sample.options)).toBe(true);
    expect(sample.correct_answer).toBeGreaterThanOrEqual(0);
    expect(sample.correct_answer).toBeLessThan(sample.options.length);
  });
});
