# 📚 Quiz Content Harvester - Complete Runbook

## 🚀 Quick Start (Local Execution)

### 1. Install Dependencies

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install -r requirements_local.txt
```

### 2. Run Basic Harvest (Fast - 10 minutes)

```bash
# Harvest 100 pieces of content, generate ~500 questions
python3 local_harvester.py --max-content 100 --questions-per-content 5

# Output:
# ✓ Database: ./harvest_output/harvest.db
# ✓ CSV: ./harvest_output/quiz_harvest_*.csv
# ✓ Stats: ./harvest_output/harvest_stats_*.json
```

### 3. Run Massive Harvest (2-3 hours)

```bash
# Harvest 1000+ content pieces, generate 5000+ questions
python3 local_harvester.py --max-content 1000 --questions-per-content 10 --workers 20
```

## 📋 Complete Execution Modes

### Mode 1: Quick Test Run

```bash
# Test with minimal data (5 minutes)
python3 local_harvester.py \
  --output-dir ./test_harvest \
  --max-content 20 \
  --questions-per-content 3 \
  --workers 5
```

### Mode 2: Daily Harvest

```bash
# Daily automated harvest (30 minutes)
python3 local_harvester.py \
  --output-dir ./daily_harvest \
  --max-content 200 \
  --questions-per-content 5 \
  --workers 10
```

### Mode 3: Weekend Mega Harvest

```bash
# Massive weekend harvest (4-6 hours)
python3 local_harvester.py \
  --output-dir ./mega_harvest \
  --max-content 2000 \
  --questions-per-content 10 \
  --workers 30
```

### Mode 4: Continuous Harvest (Run Forever)

```bash
# Create continuous harvest script
cat > continuous_harvest.py << 'EOF'
#!/usr/bin/env python3
import time
import subprocess
from datetime import datetime

def run_harvest():
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_dir = f"./continuous_harvest/{timestamp}"

    cmd = [
        "python3", "local_harvester.py",
        "--output-dir", output_dir,
        "--max-content", "100",
        "--questions-per-content", "5",
        "--workers", "10"
    ]

    print(f"[{datetime.now()}] Starting harvest...")
    subprocess.run(cmd)
    print(f"[{datetime.now()}] Harvest complete. Sleeping 1 hour...")

while True:
    run_harvest()
    time.sleep(3600)  # Run every hour
EOF

chmod +x continuous_harvest.py
./continuous_harvest.py
```

## 🎯 Harvest Sources Configuration

### What Gets Harvested:

| Source Type        | Examples                     | Questions/Source |
| ------------------ | ---------------------------- | ---------------- |
| **Documentation**  | AWS, Azure, GCP, K8s, Docker | 50-100           |
| **Stack Overflow** | 40+ tech tags                | 20-50 per tag    |
| **GitHub**         | Awesome lists, READMEs       | 10-30            |
| **Tutorials**      | W3Schools, GeeksforGeeks     | 20-40            |
| **Tech Blogs**     | AWS Blog, Netflix Tech       | 10-20            |
| **Certifications** | AWS SAA, CKA, CISSP          | 100+             |

### Custom Source Lists:

```python
# Edit local_harvester.py get_massive_source_list() to add:
'your_sources': [
    {'name': 'YourTech', 'urls': [
        'https://docs.yourtech.com/guide',
        'https://docs.yourtech.com/api',
    ]}
]
```

## 📊 Output Files Explained

### 1. SQLite Database (`harvest.db`)

```sql
-- View all questions
sqlite3 harvest_output/harvest.db "SELECT * FROM generated_questions LIMIT 10;"

-- Get statistics
sqlite3 harvest_output/harvest.db "
  SELECT category, COUNT(*) as count
  FROM generated_questions
  GROUP BY category
  ORDER BY count DESC;"

-- Export specific category
sqlite3 harvest_output/harvest.db "
  SELECT * FROM generated_questions
  WHERE category='kubernetes'
  ORDER BY difficulty;" > kubernetes_questions.csv
```

### 2. CSV Report (`quiz_harvest_*.csv`)

```python
# Load and analyze in Python
import pandas as pd

df = pd.read_csv('harvest_output/quiz_harvest_20240101_120000.csv')

# Statistics
print(f"Total Questions: {len(df)}")
print(f"Categories: {df['category'].nunique()}")
print(f"Difficulty Distribution:\n{df['difficulty'].value_counts()}")

# Filter high-confidence questions
high_quality = df[df['confidence'] > 0.85]
high_quality.to_csv('high_quality_questions.csv', index=False)
```

### 3. Statistics Report (`harvest_stats_*.json`)

```python
import json

with open('harvest_output/harvest_stats_20240101_120000.json') as f:
    stats = json.load(f)

print(f"Content Harvested: {stats['total_content']}")
print(f"Questions Generated: {stats['total_questions']}")
print(f"Categories: {stats['questions_by_category']}")
```

## 🔄 Automation & Scheduling

### Linux/Mac Cron Job

```bash
# Edit crontab
crontab -e

# Run daily at 2 AM
0 2 * * * cd /path/to/QuizMentor && ./venv/bin/python local_harvester.py --max-content 200

# Run every 6 hours
0 */6 * * * cd /path/to/QuizMentor && ./venv/bin/python local_harvester.py --max-content 50

# Weekly mega harvest on Sunday
0 3 * * 0 cd /path/to/QuizMentor && ./venv/bin/python local_harvester.py --max-content 1000
```

### Windows Task Scheduler

```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "python.exe" `
  -Argument "C:\QuizMentor\local_harvester.py --max-content 200" `
  -WorkingDirectory "C:\QuizMentor"

$trigger = New-ScheduledTaskTrigger -Daily -At 2am

Register-ScheduledTask -TaskName "QuizHarvester" `
  -Action $action -Trigger $trigger
```

### Docker Container (Run Anywhere)

```dockerfile
# Create Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements_local.txt .
RUN pip install -r requirements_local.txt

COPY local_harvester.py .
COPY quiz_testing_framework.py .
COPY question_generator.py .

# Run harvest every 6 hours
CMD while true; do \
      python local_harvester.py --max-content 200; \
      sleep 21600; \
    done
```

```bash
# Build and run
docker build -t quiz-harvester .
docker run -d -v $(pwd)/harvest_output:/app/harvest_output quiz-harvester
```

## 🎨 Uniqueness & Quality Assurance

### Uniqueness Checking

The system ensures uniqueness through:

1. **MD5 Fingerprinting** - Each question gets unique hash
2. **Fuzzy Matching** - 85% similarity threshold
3. **Database Constraints** - UNIQUE on fingerprint column
4. **Category Isolation** - Checks within same category

### Quality Filters

```python
# All questions pass through:
- Minimum content length: 500 chars
- Minimum options: 4
- Maximum similarity between options: 60%
- Confidence score threshold: 0.75
- Explanation required
```

### Manual Quality Review

```python
# Review low-confidence questions
import sqlite3
import pandas as pd

conn = sqlite3.connect('harvest_output/harvest.db')
df = pd.read_sql_query('''
    SELECT * FROM generated_questions
    WHERE confidence < 0.75
    ORDER BY confidence DESC
''', conn)

# Review and update
for idx, row in df.iterrows():
    print(f"\nQuestion: {row['question']}")
    print(f"Confidence: {row['confidence']}")
    # Make manual corrections...
```

## 📈 Scaling Strategies

### 1. Parallel Processing

```python
# Increase workers for faster harvesting
python3 local_harvester.py --workers 50  # Use 50 parallel threads
```

### 2. Distributed Harvesting

```python
# Split across multiple machines
# Machine 1: Documentation
python3 local_harvester.py --source-filter documentation

# Machine 2: Stack Overflow
python3 local_harvester.py --source-filter stackoverflow

# Machine 3: GitHub
python3 local_harvester.py --source-filter github
```

### 3. Incremental Harvesting

```python
# Only harvest new content
python3 local_harvester.py --incremental --since "2024-01-01"
```

## 🔍 Monitoring & Debugging

### View Real-time Progress

```bash
# Watch the harvest progress
watch -n 1 'sqlite3 harvest_output/harvest.db "SELECT COUNT(*) FROM generated_questions"'
```

### Debug Failed Harvests

```bash
# Check error logs
grep "Error" harvest_output/*.log

# Retry failed URLs
python3 local_harvester.py --retry-failed
```

### Performance Monitoring

```python
# Monitor harvest performance
import sqlite3
import matplotlib.pyplot as plt

conn = sqlite3.connect('harvest_output/harvest.db')
df = pd.read_sql_query('''
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM generated_questions
    GROUP BY DATE(created_at)
''', conn)

df.plot(x='date', y='count', kind='bar')
plt.title('Questions Generated Per Day')
plt.show()
```

## 🚨 Troubleshooting

### Common Issues:

#### 1. Rate Limiting

```bash
# Error: 429 Too Many Requests
# Solution: Reduce workers
python3 local_harvester.py --workers 5 --delay 2
```

#### 2. Memory Issues

```bash
# Error: MemoryError
# Solution: Process in batches
python3 local_harvester.py --batch-size 50 --max-content 100
```

#### 3. Duplicate Questions

```sql
-- Find and remove duplicates
DELETE FROM generated_questions
WHERE id NOT IN (
    SELECT MIN(id)
    FROM generated_questions
    GROUP BY fingerprint
);
```

#### 4. Low Quality Content

```python
# Filter high-quality only
python3 local_harvester.py --min-quality 0.8 --min-content-length 1000
```

## 📋 Production Checklist

### Before Running in Production:

- [ ] **Storage**: Ensure 10GB+ free space
- [ ] **Memory**: Minimum 4GB RAM available
- [ ] **Network**: Stable internet connection
- [ ] **Rate Limits**: Configure delays for external APIs
- [ ] **Backup**: Set up database backups
- [ ] **Monitoring**: Configure alerts for failures
- [ ] **Deduplication**: Enable uniqueness checking
- [ ] **Quality Threshold**: Set minimum confidence to 0.75+
- [ ] **Legal**: Respect robots.txt and ToS
- [ ] **Logging**: Enable detailed logging

### Environment Variables:

```bash
export HARVEST_OUTPUT_DIR=/data/quiz_harvest
export HARVEST_MAX_WORKERS=20
export HARVEST_MIN_QUALITY=0.75
export HARVEST_DELAY=1.0
export HARVEST_BATCH_SIZE=100
```

## 🎯 Expected Results

### Per Hour of Harvesting:

| Metric              | Conservative | Typical | Aggressive |
| ------------------- | ------------ | ------- | ---------- |
| Content Scraped     | 50           | 200     | 500        |
| Questions Generated | 250          | 1,000   | 2,500      |
| Categories Covered  | 10           | 25      | 40         |
| Unique Questions    | 95%          | 90%     | 85%        |
| Quality (>0.75)     | 80%          | 75%     | 70%        |

### After 24 Hours Continuous:

- **Content**: 5,000+ pages
- **Questions**: 25,000+ generated
- **Unique**: 20,000+ after deduplication
- **High Quality**: 15,000+ (confidence > 0.75)
- **Categories**: 50+ technology areas
- **Database Size**: ~500MB
- **CSV Export**: ~50MB

## 🎉 Success Metrics

Your harvest is successful when:

✅ **Quantity**: 10,000+ unique questions generated
✅ **Quality**: 75%+ pass quality threshold
✅ **Coverage**: 40+ technology categories
✅ **Uniqueness**: <5% duplicate rate
✅ **Difficulty**: Balanced 1-5 distribution
✅ **Performance**: <10 seconds per question generated

## 🚀 Next Steps

1. **Run Initial Harvest**

   ```bash
   python3 local_harvester.py --max-content 100
   ```

2. **Review Quality**

   ```bash
   sqlite3 harvest_output/harvest.db "SELECT * FROM generated_questions LIMIT 20;"
   ```

3. **Export High Quality**

   ```python
   # Export questions with confidence > 0.85
   python3 export_high_quality.py
   ```

4. **Deploy to Production**

   ```bash
   # Import to main quiz database
   python3 import_to_production.py harvest_output/quiz_harvest_*.csv
   ```

5. **Schedule Automation**
   ```bash
   # Set up daily harvests
   crontab -e
   # Add: 0 2 * * * /path/to/harvest_script.sh
   ```

---

**Happy Harvesting! 🎯 Your quiz content will grow from 500 to 50,000+ questions!**
