#!/usr/bin/env python3
"""
Enhanced Harvest Report Generator - Creates detailed HTML report with quality metrics
"""

import json
import sqlite3
import pandas as pd
from pathlib import Path
from datetime import datetime
from collections import Counter
import html

class EnhancedReportGenerator:
    """Generate comprehensive HTML report for enhanced harvest"""
    
    def __init__(self, db_path: str = "harvest_output/enhanced_harvest.db"):
        self.db_path = db_path
        self.output_path = "enhanced_harvest_report.html"
        self.conn = sqlite3.connect(self.db_path)
        
    def load_data(self):
        """Load all data from enhanced harvest database"""
        
        # Load questions with all quality metrics
        self.questions_df = pd.read_sql_query("""
            SELECT 
                id,
                question,
                options,
                correct_answer,
                explanation,
                category,
                subcategory,
                difficulty,
                confidence,
                source_url,
                source_type,
                distractor_quality,
                answer_distribution,
                concepts,
                created_at
            FROM enhanced_questions
            ORDER BY created_at DESC, confidence DESC
        """, self.conn)
        
        # Parse JSON fields
        self.questions_df['options'] = self.questions_df['options'].apply(
            lambda x: json.loads(x) if isinstance(x, str) else x
        )
        self.questions_df['concepts'] = self.questions_df['concepts'].apply(
            lambda x: json.loads(x) if isinstance(x, str) else []
        )
        
    def generate_html(self):
        """Generate comprehensive HTML report with enhanced metrics"""
        
        # Calculate statistics
        total_questions = len(self.questions_df)
        
        if total_questions == 0:
            return self.generate_empty_report()
        
        avg_confidence = self.questions_df['confidence'].mean()
        avg_distractor_quality = self.questions_df['distractor_quality'].mean()
        
        # Group by category
        category_stats = self.questions_df.groupby('category').agg({
            'id': 'count',
            'confidence': 'mean',
            'distractor_quality': 'mean',
            'difficulty': lambda x: x.value_counts().to_dict()
        }).rename(columns={'id': 'count'})
        
        # Answer distribution
        answer_dist = Counter(self.questions_df['answer_distribution'])
        
        # Difficulty distribution
        difficulty_dist = self.questions_df['difficulty'].value_counts().sort_index()
        
        # Source type distribution
        source_dist = self.questions_df['source_type'].value_counts()
        
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Quiz Harvest Report - {datetime.now().strftime('%Y-%m-%d %H:%M')}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}
        
        .container {{
            max-width: 1600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }}
        
        header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        
        h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        
        .subtitle {{
            font-size: 1.2em;
            opacity: 0.9;
        }}
        
        .quality-badge {{
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            margin: 10px 5px;
            font-weight: bold;
            font-size: 0.9em;
        }}
        
        .quality-high {{
            background: #4caf50;
            color: white;
        }}
        
        .quality-medium {{
            background: #ff9800;
            color: white;
        }}
        
        .quality-low {{
            background: #f44336;
            color: white;
        }}
        
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }}
        
        .stat-card {{
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s;
        }}
        
        .stat-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }}
        
        .stat-number {{
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }}
        
        .stat-label {{
            color: #666;
            margin-top: 5px;
        }}
        
        .quality-meter {{
            width: 100%;
            height: 20px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }}
        
        .quality-fill {{
            height: 100%;
            background: linear-gradient(to right, #f44336, #ff9800, #4caf50);
            transition: width 0.3s;
        }}
        
        .section {{
            padding: 40px;
        }}
        
        .section-title {{
            font-size: 1.8em;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }}
        
        .answer-distribution {{
            display: flex;
            justify-content: space-around;
            align-items: flex-end;
            height: 200px;
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }}
        
        .answer-bar {{
            flex: 1;
            margin: 0 10px;
            background: linear-gradient(to top, #667eea, #764ba2);
            border-radius: 5px 5px 0 0;
            position: relative;
            min-height: 20px;
            transition: all 0.3s;
        }}
        
        .answer-bar:hover {{
            opacity: 0.8;
        }}
        
        .answer-label {{
            position: absolute;
            bottom: -30px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 1.2em;
            font-weight: bold;
            color: #333;
        }}
        
        .answer-count {{
            position: absolute;
            top: -30px;
            left: 0;
            right: 0;
            text-align: center;
            font-weight: bold;
            color: #333;
        }}
        
        .answer-percent {{
            position: absolute;
            top: 10px;
            left: 0;
            right: 0;
            text-align: center;
            color: white;
            font-weight: bold;
        }}
        
        .difficulty-chart {{
            display: flex;
            align-items: center;
            margin: 20px 0;
        }}
        
        .difficulty-bar {{
            flex: 1;
            height: 30px;
            display: flex;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        
        .diff-1 {{ background: #4caf50; }}
        .diff-2 {{ background: #8bc34a; }}
        .diff-3 {{ background: #ff9800; }}
        .diff-4 {{ background: #ff5722; }}
        .diff-5 {{ background: #f44336; }}
        
        .category-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }}
        
        .category-card {{
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            transition: all 0.3s;
        }}
        
        .category-card:hover {{
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transform: translateY(-5px);
        }}
        
        .category-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }}
        
        .category-name {{
            font-size: 1.3em;
            font-weight: bold;
            color: #333;
            text-transform: capitalize;
        }}
        
        .category-count {{
            background: #667eea;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
        }}
        
        .metric-row {{
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px solid #f0f0f0;
        }}
        
        .metric-label {{
            color: #666;
        }}
        
        .metric-value {{
            font-weight: bold;
            color: #333;
        }}
        
        .sample-questions {{
            margin-top: 30px;
        }}
        
        .question-card {{
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }}
        
        .question-text {{
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            font-size: 1.1em;
        }}
        
        .options-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin: 15px 0;
        }}
        
        .option {{
            padding: 10px;
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            transition: all 0.3s;
        }}
        
        .option.correct {{
            background: #e8f5e9;
            border-color: #4caf50;
            font-weight: bold;
        }}
        
        .option-label {{
            font-weight: bold;
            color: #667eea;
            margin-right: 5px;
        }}
        
        .question-metrics {{
            display: flex;
            gap: 20px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
        }}
        
        .question-metric {{
            display: flex;
            align-items: center;
            gap: 5px;
        }}
        
        .metric-icon {{
            font-size: 1.2em;
        }}
        
        .explanation-box {{
            background: #f1f8ff;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
            border-left: 3px solid #2196f3;
        }}
        
        .concepts-list {{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        }}
        
        .concept-tag {{
            background: #e3f2fd;
            color: #1976d2;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.9em;
        }}
        
        .warning-box {{
            background: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }}
        
        .success-box {{
            background: #d4edda;
            border: 1px solid #28a745;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }}
        
        .footer {{
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎯 Enhanced Quiz Harvest Report</h1>
            <div class="subtitle">Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</div>
            <div style="margin-top: 20px;">
"""
        
        # Add quality badges
        if avg_confidence >= 0.8:
            html_content += '<span class="quality-badge quality-high">HIGH CONFIDENCE</span>'
        elif avg_confidence >= 0.6:
            html_content += '<span class="quality-badge quality-medium">MEDIUM CONFIDENCE</span>'
        else:
            html_content += '<span class="quality-badge quality-low">LOW CONFIDENCE</span>'
            
        if avg_distractor_quality >= 0.8:
            html_content += '<span class="quality-badge quality-high">EXCELLENT DISTRACTORS</span>'
        elif avg_distractor_quality >= 0.6:
            html_content += '<span class="quality-badge quality-medium">GOOD DISTRACTORS</span>'
        else:
            html_content += '<span class="quality-badge quality-low">WEAK DISTRACTORS</span>'
        
        # Check answer distribution balance
        answer_balance = max(answer_dist.values()) - min(answer_dist.values()) if answer_dist else 0
        if answer_balance <= 5:
            html_content += '<span class="quality-badge quality-high">BALANCED ANSWERS</span>'
        elif answer_balance <= 10:
            html_content += '<span class="quality-badge quality-medium">MOSTLY BALANCED</span>'
        else:
            html_content += '<span class="quality-badge quality-low">UNBALANCED ANSWERS</span>'
        
        html_content += """
            </div>
        </header>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">""" + f"{total_questions:,}" + """</div>
                <div class="stat-label">Total Questions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">""" + f"{len(category_stats)}" + """</div>
                <div class="stat-label">Categories</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">""" + f"{avg_confidence:.1%}" + """</div>
                <div class="stat-label">Avg Confidence</div>
                <div class="quality-meter">
                    <div class="quality-fill" style="width: """ + f"{avg_confidence*100:.0f}%" + """"></div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-number">""" + f"{avg_distractor_quality:.1%}" + """</div>
                <div class="stat-label">Distractor Quality</div>
                <div class="quality-meter">
                    <div class="quality-fill" style="width: """ + f"{avg_distractor_quality*100:.0f}%" + """"></div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">📊 Answer Distribution Analysis</h2>
            <div class="answer-distribution">
"""
        
        # Add answer distribution bars
        max_count = max(answer_dist.values()) if answer_dist else 1
        for answer in ['A', 'B', 'C', 'D']:
            count = answer_dist.get(answer, 0)
            percentage = (count / total_questions * 100) if total_questions > 0 else 0
            height = (count / max_count * 100) if max_count > 0 else 0
            
            html_content += f"""
                <div class="answer-bar" style="height: {height}%">
                    <div class="answer-label">{answer}</div>
                    <div class="answer-count">{count}</div>
                    <div class="answer-percent">{percentage:.1f}%</div>
                </div>
"""
        
        html_content += """
            </div>
"""
        
        # Add balance analysis
        if answer_balance <= 5:
            html_content += """
            <div class="success-box">
                ✅ <strong>Excellent Answer Balance!</strong> The correct answers are well distributed across all positions (A, B, C, D), 
                preventing pattern recognition and ensuring fair assessment.
            </div>
"""
        elif answer_balance <= 10:
            html_content += """
            <div class="warning-box">
                ⚠️ <strong>Good Answer Balance.</strong> The answer distribution is mostly balanced but could be improved slightly.
                Consider generating more questions to achieve perfect balance.
            </div>
"""
        else:
            html_content += """
            <div class="warning-box">
                ⚠️ <strong>Answer Distribution Needs Improvement.</strong> Some positions are overrepresented. 
                The enhanced harvester will auto-balance in future batches.
            </div>
"""
        
        html_content += """
        </div>
        
        <div class="section">
            <h2 class="section-title">📈 Difficulty Distribution</h2>
            <div class="difficulty-chart">
                <div class="difficulty-bar">
"""
        
        # Add difficulty distribution
        for level in range(1, 6):
            count = difficulty_dist.get(level, 0)
            percentage = (count / total_questions * 100) if total_questions > 0 else 0
            if percentage > 0:
                html_content += f'<div class="diff-{level}" style="width: {percentage}%" title="Level {level}: {count} questions ({percentage:.1f}%)"></div>'
        
        html_content += """
                </div>
            </div>
            <div style="display: flex; justify-content: space-around; margin-top: 10px;">
                <span>🟢 Easy</span>
                <span>🟡 Medium</span>
                <span>🟠 Hard</span>
                <span>🔴 Expert</span>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">📁 Categories & Quality Metrics</h2>
            <div class="category-grid">
"""
        
        # Add category cards
        for category, stats in category_stats.iterrows():
            html_content += f"""
                <div class="category-card">
                    <div class="category-header">
                        <div class="category-name">{category}</div>
                        <div class="category-count">{int(stats['count'])}</div>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Confidence:</span>
                        <span class="metric-value">{stats['confidence']:.1%}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Distractor Quality:</span>
                        <span class="metric-value">{stats['distractor_quality']:.1%}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Difficulty Range:</span>
                        <span class="metric-value">{min(stats['difficulty'].keys()) if stats['difficulty'] else 0}-{max(stats['difficulty'].keys()) if stats['difficulty'] else 0}</span>
                    </div>
                </div>
"""
        
        html_content += """
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">📝 Sample Questions (Top Quality)</h2>
            <div class="sample-questions">
"""
        
        # Add top 5 high-quality questions
        top_questions = self.questions_df.nlargest(5, 'distractor_quality')
        
        for _, q in top_questions.iterrows():
            options = q['options']
            correct_idx = q['correct_answer']
            
            html_content += f"""
                <div class="question-card">
                    <div class="question-text">{html.escape(q['question'])}</div>
                    <div class="options-grid">
"""
            
            for i, option in enumerate(options):
                correct_class = "correct" if i == correct_idx else ""
                label = "ABCD"[i]
                html_content += f"""
                        <div class="option {correct_class}">
                            <span class="option-label">{label}.</span>
                            {html.escape(str(option))}
                        </div>
"""
            
            html_content += f"""
                    </div>
                    <div class="explanation-box">
                        <strong>💡 Explanation:</strong> {html.escape(q['explanation'][:300])}...
                    </div>
                    <div class="question-metrics">
                        <div class="question-metric">
                            <span class="metric-icon">📊</span>
                            <span>Difficulty: Level {q['difficulty']}</span>
                        </div>
                        <div class="question-metric">
                            <span class="metric-icon">🎯</span>
                            <span>Confidence: {q['confidence']:.0%}</span>
                        </div>
                        <div class="question-metric">
                            <span class="metric-icon">✨</span>
                            <span>Distractor Quality: {q['distractor_quality']:.0%}</span>
                        </div>
                        <div class="question-metric">
                            <span class="metric-icon">🔤</span>
                            <span>Answer: {q['answer_distribution']}</span>
                        </div>
                    </div>
"""
            
            if q['concepts']:
                html_content += """
                    <div class="concepts-list">
                        <strong>Key Concepts:</strong>
"""
                for concept in q['concepts'][:5]:
                    html_content += f'<span class="concept-tag">{html.escape(concept)}</span>'
                
                html_content += """
                    </div>
"""
            
            html_content += """
                </div>
"""
        
        html_content += """
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">📊 Source Analysis</h2>
"""
        
        # Add source type distribution
        html_content += """
            <div class="stats-grid">
"""
        
        for source_type, count in source_dist.items():
            percentage = (count / total_questions * 100) if total_questions > 0 else 0
            html_content += f"""
                <div class="stat-card">
                    <div class="stat-number">{count}</div>
                    <div class="stat-label">{source_type.title()}</div>
                    <div style="color: #999; font-size: 0.9em">{percentage:.1f}%</div>
                </div>
"""
        
        html_content += """
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">✅ Quality Summary</h2>
"""
        
        # Quality summary
        high_quality = len(self.questions_df[(self.questions_df['confidence'] >= 0.8) & (self.questions_df['distractor_quality'] >= 0.8)])
        medium_quality = len(self.questions_df[(self.questions_df['confidence'] >= 0.6) & (self.questions_df['distractor_quality'] >= 0.6)]) - high_quality
        low_quality = total_questions - high_quality - medium_quality
        
        html_content += f"""
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number" style="color: #4caf50">{high_quality}</div>
                    <div class="stat-label">High Quality</div>
                    <div style="color: #999; font-size: 0.9em">Confidence ≥80%, Distractors ≥80%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #ff9800">{medium_quality}</div>
                    <div class="stat-label">Medium Quality</div>
                    <div style="color: #999; font-size: 0.9em">Confidence ≥60%, Distractors ≥60%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: #f44336">{low_quality}</div>
                    <div class="stat-label">Needs Review</div>
                    <div style="color: #999; font-size: 0.9em">Below quality thresholds</div>
                </div>
            </div>
"""
        
        if high_quality >= total_questions * 0.7:
            html_content += """
            <div class="success-box">
                🎉 <strong>Excellent Quality!</strong> Over 70% of questions meet high quality standards. 
                These questions have strong confidence scores and well-crafted distractors.
            </div>
"""
        elif high_quality >= total_questions * 0.5:
            html_content += """
            <div class="success-box">
                ✅ <strong>Good Quality!</strong> Over 50% of questions meet high quality standards. 
                Consider reviewing medium-quality questions for potential improvements.
            </div>
"""
        else:
            html_content += """
            <div class="warning-box">
                ⚠️ <strong>Quality Review Needed.</strong> Less than 50% of questions meet high quality standards. 
                Consider adjusting harvest parameters or sources for better results.
            </div>
"""
        
        html_content += """
        </div>
        
        <div class="footer">
            <p>Enhanced Harvest Report Generated on """ + datetime.now().strftime('%Y-%m-%d at %H:%M:%S') + """</p>
            <p>Total Questions: """ + str(total_questions) + """ | Categories: """ + str(len(category_stats)) + """ | Average Quality: """ + f"{(avg_confidence + avg_distractor_quality) / 2:.1%}" + """</p>
        </div>
    </div>
</body>
</html>
"""
        
        return html_content
    
    def generate_empty_report(self):
        """Generate report when no questions exist"""
        return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Quiz Harvest Report - No Data</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
    <h1>No Questions Found</h1>
    <p>The enhanced harvest database is empty. Please run the enhanced harvester first:</p>
    <code style="background: #f0f0f0; padding: 10px; border-radius: 5px;">python3 enhanced_harvester.py</code>
</body>
</html>
"""
    
    def generate_report(self):
        """Generate and save the HTML report"""
        print("📊 Loading enhanced harvest data...")
        self.load_data()
        
        print("🎨 Generating enhanced HTML report...")
        html = self.generate_html()
        
        print(f"💾 Saving report to {self.output_path}...")
        with open(self.output_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"✅ Report generated successfully!")
        print(f"📄 Open {self.output_path} in your browser to review")
        
        return self.output_path

def main():
    """Generate the enhanced harvest report"""
    print("""
╔══════════════════════════════════════════════════════════╗
║         ENHANCED HARVEST REPORT GENERATOR                 ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    generator = EnhancedReportGenerator()
    report_path = generator.generate_report()
    
    # Try to open in browser
    import webbrowser
    import os
    
    file_url = f"file://{os.path.abspath(report_path)}"
    print(f"\n🌐 Opening report in browser...")
    webbrowser.open(file_url)
    
    print("\n✨ Enhanced Report Features:")
    print("  • Answer distribution analysis (A,B,C,D balance)")
    print("  • Distractor quality metrics")
    print("  • Difficulty distribution chart")
    print("  • Category-wise quality scores")
    print("  • Sample high-quality questions")
    print("  • Key concepts extraction")
    print("  • Source type analysis")
    print("  • Quality summary with recommendations")

if __name__ == "__main__":
    main()
