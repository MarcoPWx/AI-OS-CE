#!/usr/bin/env python3
"""
Harvest Report Generator - Creates a comprehensive HTML report of harvested quiz content
Review all questions, sources, and quality metrics before importing
"""

import json
import sqlite3
import pandas as pd
from pathlib import Path
from datetime import datetime
from collections import defaultdict
import html

class HarvestReportGenerator:
    """Generate comprehensive HTML report of harvested content"""
    
    def __init__(self, harvest_db: str = "harvest_output/harvest.db"):
        self.db_path = harvest_db
        self.output_path = "harvest_report.html"
        self.conn = sqlite3.connect(self.db_path)
        
    def load_data(self):
        """Load all data from harvest database"""
        
        # Load questions
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
                source,
                created_at
            FROM generated_questions
            ORDER BY category, confidence DESC
        """, self.conn)
        
        # Parse JSON options
        self.questions_df['options'] = self.questions_df['options'].apply(
            lambda x: json.loads(x) if isinstance(x, str) else x
        )
        
        # Load content sources
        self.content_df = pd.read_sql_query("""
            SELECT 
                source_url,
                source_type,
                title,
                category,
                subcategory,
                quality_score,
                scraped_at
            FROM harvested_content
            ORDER BY source_type, category
        """, self.conn)
        
        # Load statistics
        self.stats_df = pd.read_sql_query("""
            SELECT * FROM harvest_stats
            ORDER BY timestamp DESC
            LIMIT 1
        """, self.conn)
        
    def generate_html(self):
        """Generate comprehensive HTML report"""
        
        # Calculate statistics
        total_questions = len(self.questions_df)
        total_content = len(self.content_df)
        categories = self.questions_df['category'].nunique()
        avg_confidence = self.questions_df['confidence'].mean()
        
        # Group questions by category
        questions_by_category = self.questions_df.groupby('category').agg({
            'id': 'count',
            'confidence': 'mean',
            'difficulty': lambda x: x.value_counts().to_dict()
        }).rename(columns={'id': 'count'})
        
        # Group content by source type
        content_by_type = self.content_df.groupby('source_type').size()
        
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz Harvest Report - {datetime.now().strftime('%Y-%m-%d %H:%M')}</title>
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
            max-width: 1400px;
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
        
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
        
        .tabs {{
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }}
        
        .tab {{
            padding: 10px 20px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1em;
            color: #666;
            transition: all 0.3s;
            position: relative;
        }}
        
        .tab:hover {{
            color: #667eea;
        }}
        
        .tab.active {{
            color: #667eea;
            font-weight: bold;
        }}
        
        .tab.active::after {{
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 3px;
            background: #667eea;
        }}
        
        .tab-content {{
            display: none;
        }}
        
        .tab-content.active {{
            display: block;
        }}
        
        .category-card {{
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
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
        }}
        
        .category-stats {{
            display: flex;
            gap: 15px;
        }}
        
        .badge {{
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }}
        
        .badge-count {{
            background: #e3f2fd;
            color: #1976d2;
        }}
        
        .badge-confidence {{
            background: #e8f5e9;
            color: #388e3c;
        }}
        
        .badge-difficulty {{
            background: #fff3e0;
            color: #f57c00;
        }}
        
        .question-list {{
            margin-top: 20px;
        }}
        
        .question-item {{
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
        }}
        
        .question-text {{
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }}
        
        .options-list {{
            list-style: none;
            margin: 10px 0;
        }}
        
        .option {{
            padding: 5px 10px;
            margin: 5px 0;
            background: white;
            border-radius: 5px;
            border: 1px solid #e0e0e0;
        }}
        
        .option.correct {{
            background: #e8f5e9;
            border-color: #4caf50;
            font-weight: bold;
        }}
        
        .explanation {{
            margin-top: 10px;
            padding: 10px;
            background: #f1f8ff;
            border-radius: 5px;
            color: #666;
            font-style: italic;
        }}
        
        .question-meta {{
            display: flex;
            gap: 15px;
            margin-top: 10px;
            font-size: 0.9em;
            color: #666;
        }}
        
        .source-table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }}
        
        .source-table th,
        .source-table td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }}
        
        .source-table th {{
            background: #f8f9fa;
            font-weight: bold;
            color: #333;
        }}
        
        .source-table tr:hover {{
            background: #f8f9fa;
        }}
        
        .source-type {{
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.85em;
            font-weight: bold;
        }}
        
        .type-documentation {{
            background: #e3f2fd;
            color: #1976d2;
        }}
        
        .type-stackoverflow {{
            background: #fff3e0;
            color: #f57c00;
        }}
        
        .type-github {{
            background: #f3e5f5;
            color: #7b1fa2;
        }}
        
        .chart-container {{
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }}
        
        .bar-chart {{
            display: flex;
            align-items: flex-end;
            height: 200px;
            gap: 10px;
            margin-top: 20px;
        }}
        
        .bar {{
            flex: 1;
            background: linear-gradient(to top, #667eea, #764ba2);
            border-radius: 5px 5px 0 0;
            position: relative;
            min-height: 20px;
            transition: all 0.3s;
        }}
        
        .bar:hover {{
            opacity: 0.8;
        }}
        
        .bar-label {{
            position: absolute;
            bottom: -25px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 0.9em;
            color: #666;
        }}
        
        .bar-value {{
            position: absolute;
            top: -25px;
            left: 0;
            right: 0;
            text-align: center;
            font-weight: bold;
            color: #333;
        }}
        
        .quality-indicator {{
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }}
        
        .quality-bar {{
            width: 100px;
            height: 10px;
            background: #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
        }}
        
        .quality-fill {{
            height: 100%;
            background: linear-gradient(to right, #f44336, #ff9800, #4caf50);
            transition: width 0.3s;
        }}
        
        .filter-controls {{
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }}
        
        .filter-group {{
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        
        .filter-label {{
            font-weight: bold;
            color: #666;
        }}
        
        .filter-select {{
            padding: 8px 15px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            background: white;
            cursor: pointer;
        }}
        
        .summary-box {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin: 20px 0;
        }}
        
        .summary-title {{
            font-size: 1.5em;
            margin-bottom: 15px;
        }}
        
        .summary-text {{
            line-height: 1.8;
        }}
        
        .action-buttons {{
            display: flex;
            gap: 15px;
            margin-top: 30px;
            justify-content: center;
        }}
        
        .btn {{
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 1em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }}
        
        .btn-primary {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }}
        
        .btn-secondary {{
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
        }}
        
        .btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
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
        
        @media (max-width: 768px) {{
            .stats-grid {{
                grid-template-columns: 1fr;
            }}
            
            .tabs {{
                flex-direction: column;
            }}
            
            .filter-controls {{
                flex-direction: column;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 Quiz Harvest Report</h1>
            <div class="subtitle">Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</div>
        </header>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">{total_questions:,}</div>
                <div class="stat-label">Total Questions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{total_content:,}</div>
                <div class="stat-label">Content Sources</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{categories}</div>
                <div class="stat-label">Categories</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{avg_confidence:.1%}</div>
                <div class="stat-label">Avg Confidence</div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">📈 Overview</h2>
            
            <div class="summary-box">
                <div class="summary-title">Harvest Summary</div>
                <div class="summary-text">
                    Successfully harvested <strong>{total_questions:,}</strong> quiz questions from <strong>{total_content:,}</strong> content sources.
                    Questions span <strong>{categories}</strong> technology categories with an average confidence score of <strong>{avg_confidence:.1%}</strong>.
                    The harvest included content from {', '.join([f"<strong>{k}</strong> ({v})" for k, v in content_by_type.items()])}.
                </div>
            </div>
            
            <div class="chart-container">
                <h3>Questions by Category</h3>
                <div class="bar-chart">
"""
        
        # Add bar chart for top categories
        top_categories = questions_by_category.nlargest(10, 'count')
        max_count = top_categories['count'].max()
        
        for cat, row in top_categories.iterrows():
            height_percent = (row['count'] / max_count) * 100
            html_content += f"""
                    <div class="bar" style="height: {height_percent}%">
                        <div class="bar-value">{row['count']}</div>
                        <div class="bar-label">{cat[:8]}</div>
                    </div>
"""
        
        html_content += """
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">📝 Questions by Category</h2>
            
            <div class="tabs">
"""
        
        # Add category tabs
        for i, (cat, _) in enumerate(questions_by_category.iterrows()):
            active = "active" if i == 0 else ""
            html_content += f'                <button class="tab {active}" onclick="showTab(\'{cat}\')">{cat.title()}</button>\n'
        
        html_content += """
            </div>
            
            <div class="tab-contents">
"""
        
        # Add content for each category
        for i, (cat, cat_stats) in enumerate(questions_by_category.iterrows()):
            active = "active" if i == 0 else ""
            cat_questions = self.questions_df[self.questions_df['category'] == cat].head(10)
            
            html_content += f"""
                <div class="tab-content {active}" id="tab-{cat}">
                    <div class="category-card">
                        <div class="category-header">
                            <div class="category-name">{cat.title()}</div>
                            <div class="category-stats">
                                <span class="badge badge-count">{cat_stats['count']} questions</span>
                                <span class="badge badge-confidence">{cat_stats['confidence']:.0%} confidence</span>
                            </div>
                        </div>
                        
                        <div class="question-list">
"""
            
            # Add sample questions
            for _, q in cat_questions.iterrows():
                options_html = ""
                for i, option in enumerate(q['options']):
                    correct_class = "correct" if i == q['correct_answer'] else ""
                    options_html += f'                                <li class="option {correct_class}">{html.escape(str(option))}</li>\n'
                
                html_content += f"""
                            <div class="question-item">
                                <div class="question-text">{html.escape(q['question'])}</div>
                                <ul class="options-list">
{options_html}
                                </ul>
                                <div class="explanation">💡 {html.escape(q['explanation'][:200])}...</div>
                                <div class="question-meta">
                                    <span>📊 Difficulty: {q['difficulty']}</span>
                                    <span>🎯 Confidence: {q['confidence']:.0%}</span>
                                    <span>🏷️ {q['subcategory'] or 'General'}</span>
                                </div>
                            </div>
"""
            
            html_content += """
                        </div>
                        <div class="warning-box">
                            ℹ️ Showing first 10 questions. Full category contains """ + str(cat_stats['count']) + """ questions.
                        </div>
                    </div>
                </div>
"""
        
        html_content += """
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">🌐 Content Sources</h2>
            
            <table class="source-table">
                <thead>
                    <tr>
                        <th>Source Type</th>
                        <th>URL/Title</th>
                        <th>Category</th>
                        <th>Quality Score</th>
                        <th>Scraped At</th>
                    </tr>
                </thead>
                <tbody>
"""
        
        # Add content sources
        for _, source in self.content_df.head(50).iterrows():
            type_class = f"type-{source['source_type']}"
            quality_percent = source['quality_score'] * 100 if source['quality_score'] else 0
            
            html_content += f"""
                    <tr>
                        <td><span class="source-type {type_class}">{source['source_type']}</span></td>
                        <td>{html.escape(source['title'] or source['source_url'][:50])}</td>
                        <td>{source['category']}</td>
                        <td>
                            <div class="quality-indicator">
                                <div class="quality-bar">
                                    <div class="quality-fill" style="width: {quality_percent}%"></div>
                                </div>
                                <span>{quality_percent:.0f}%</span>
                            </div>
                        </td>
                        <td>{source['scraped_at'][:19] if source['scraped_at'] else 'N/A'}</td>
                    </tr>
"""
        
        html_content += f"""
                </tbody>
            </table>
            
            <div class="warning-box">
                ℹ️ Showing first 50 sources. Total sources harvested: {total_content}
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">✅ Quality Analysis</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">{len(self.questions_df[self.questions_df['confidence'] >= 0.8]):,}</div>
                    <div class="stat-label">High Confidence (≥80%)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{len(self.questions_df[self.questions_df['confidence'] >= 0.7]):,}</div>
                    <div class="stat-label">Good Confidence (≥70%)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{len(self.questions_df[self.questions_df['confidence'] < 0.7]):,}</div>
                    <div class="stat-label">Low Confidence (<70%)</div>
                </div>
            </div>
            
            <div class="success-box">
                ✅ <strong>Quality Check Passed!</strong> {len(self.questions_df[self.questions_df['confidence'] >= 0.75]) / len(self.questions_df) * 100:.1f}% of questions meet the quality threshold (confidence ≥ 75%).
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">🎯 Next Steps</h2>
            
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="alert('Run: python3 integrate_harvest.py')">
                    ✨ Import to QuizMentor
                </button>
                <button class="btn btn-secondary" onclick="window.print()">
                    🖨️ Print Report
                </button>
                <button class="btn btn-secondary" onclick="downloadData()">
                    💾 Export Data
                </button>
            </div>
            
            <div class="warning-box" style="margin-top: 30px;">
                <strong>⚠️ Before Importing:</strong>
                <ul style="margin-top: 10px; margin-left: 20px;">
                    <li>Review the sample questions above for accuracy</li>
                    <li>Check that categories align with your quiz structure</li>
                    <li>Consider filtering out low-confidence questions if needed</li>
                    <li>Backup your existing quiz database</li>
                </ul>
            </div>
        </div>
    </div>
    
    <script>
        function showTab(category) {{
            // Hide all tabs and contents
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Show selected tab and content
            event.target.classList.add('active');
            document.getElementById('tab-' + category).classList.add('active');
        }}
        
        function downloadData() {{
            alert('CSV file available at: harvest_output/quiz_harvest_*.csv');
        }}
        
        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {{
            anchor.addEventListener('click', function (e) {{
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({{
                    behavior: 'smooth'
                }});
            }});
        }});
    </script>
</body>
</html>
"""
        
        return html_content
    
    def generate_report(self):
        """Generate and save the HTML report"""
        print("📊 Loading harvest data...")
        self.load_data()
        
        print("🎨 Generating HTML report...")
        html = self.generate_html()
        
        print(f"💾 Saving report to {self.output_path}...")
        with open(self.output_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"✅ Report generated successfully!")
        print(f"📄 Open {self.output_path} in your browser to review")
        
        return self.output_path

def main():
    """Generate the harvest report"""
    print("""
╔══════════════════════════════════════════════════════════╗
║           HARVEST REPORT GENERATOR                        ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    generator = HarvestReportGenerator()
    report_path = generator.generate_report()
    
    # Try to open in browser
    import webbrowser
    import os
    
    file_url = f"file://{os.path.abspath(report_path)}"
    print(f"\n🌐 Opening report in browser...")
    webbrowser.open(file_url)
    
    print("\n✨ Report Features:")
    print("  • Overview of all harvested content")
    print("  • Sample questions from each category")
    print("  • Source URLs and quality scores")
    print("  • Interactive category tabs")
    print("  • Quality analysis and statistics")
    print("  • Visual charts and indicators")
    
    print("\n📋 Review the report before importing!")

if __name__ == "__main__":
    main()
