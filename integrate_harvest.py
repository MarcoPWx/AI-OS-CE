#!/usr/bin/env python3
"""
Integration Script - Convert harvested questions to QuizMentor format
Creates properly formatted quiz files from harvest data
"""

import json
import sqlite3
import csv
from pathlib import Path
from collections import defaultdict
from typing import Dict, List
import pandas as pd

class HarvestIntegrator:
    """Integrate harvested questions into QuizMentor format"""
    
    def __init__(self, harvest_db: str = "harvest_output/harvest.db"):
        self.db_path = harvest_db
        self.output_dir = Path("data/quizzes/harvested")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def load_questions(self) -> pd.DataFrame:
        """Load questions from harvest database"""
        conn = sqlite3.connect(self.db_path)
        query = """
            SELECT 
                id,
                question,
                options,
                correct_answer,
                explanation,
                category,
                subcategory,
                difficulty,
                confidence
            FROM generated_questions
            WHERE confidence >= 0.75
            ORDER BY category, difficulty
        """
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        # Parse options from JSON string
        df['options'] = df['options'].apply(json.loads)
        
        return df
    
    def create_quiz_format(self, questions_df: pd.DataFrame, category: str) -> Dict:
        """Convert questions to QuizMentor quiz format"""
        
        # Get questions for this category
        cat_questions = questions_df[questions_df['category'] == category]
        
        # Group by difficulty for balanced quiz
        questions_list = []
        
        for _, row in cat_questions.iterrows():
            question_obj = {
                "id": f"harvest_{row['id']}",
                "question": row['question'],
                "options": row['options'],
                "correct_answer": int(row['correct_answer']),
                "explanation": row['explanation'],
                "difficulty": row['difficulty'],
                "tags": [category, row['subcategory']] if row['subcategory'] else [category]
            }
            questions_list.append(question_obj)
        
        # Create quiz structure
        quiz = {
            "quiz_id": f"harvest_{category}",
            "title": f"{category.title()} Quiz (Harvested)",
            "description": f"Auto-generated quiz from harvested {category} content",
            "category": category,
            "difficulty": "mixed",
            "time_limit": 30,  # 30 minutes default
            "passing_score": 70,
            "questions": questions_list,
            "metadata": {
                "source": "automated_harvest",
                "question_count": len(questions_list),
                "difficulty_distribution": cat_questions['difficulty'].value_counts().to_dict()
            }
        }
        
        return quiz
    
    def generate_all_quizzes(self):
        """Generate quiz files for all categories"""
        print("🔄 Loading harvested questions...")
        df = self.load_questions()
        
        print(f"✅ Loaded {len(df)} high-quality questions")
        
        # Get unique categories
        categories = df['category'].unique()
        
        print(f"\n📂 Creating quizzes for {len(categories)} categories:")
        
        quiz_summary = []
        
        for category in categories:
            quiz = self.create_quiz_format(df, category)
            
            # Save quiz file
            filename = f"quiz_{category}_harvested.json"
            filepath = self.output_dir / filename
            
            with open(filepath, 'w') as f:
                json.dump(quiz, f, indent=2)
            
            quiz_info = {
                "category": category,
                "questions": len(quiz['questions']),
                "file": str(filepath),
                "difficulties": quiz['metadata']['difficulty_distribution']
            }
            quiz_summary.append(quiz_info)
            
            print(f"  ✅ {category}: {len(quiz['questions'])} questions → {filename}")
        
        # Create master index
        self.create_master_index(quiz_summary)
        
        return quiz_summary
    
    def create_master_index(self, quiz_summary: List[Dict]):
        """Create a master index of all harvested quizzes"""
        
        index = {
            "total_quizzes": len(quiz_summary),
            "total_questions": sum(q['questions'] for q in quiz_summary),
            "categories": [q['category'] for q in quiz_summary],
            "quizzes": quiz_summary,
            "integration_ready": True
        }
        
        index_path = self.output_dir / "harvest_index.json"
        with open(index_path, 'w') as f:
            json.dump(index, f, indent=2)
        
        print(f"\n📋 Master index created: {index_path}")
        
        # Print summary table
        print("\n" + "="*60)
        print("HARVEST INTEGRATION SUMMARY")
        print("="*60)
        
        print(f"\n📊 Statistics:")
        print(f"  • Total Quizzes Created: {index['total_quizzes']}")
        print(f"  • Total Questions: {index['total_questions']}")
        print(f"  • Categories: {', '.join(index['categories'][:5])}...")
        
        print(f"\n📁 Output Directory: {self.output_dir}")
        print(f"\n✨ Integration Complete! Quizzes are ready to use.")
        
        # Create simple loader script
        self.create_loader_script()
    
    def create_loader_script(self):
        """Create a simple script to load harvested quizzes"""
        
        loader_script = '''// QuizMentor Harvest Loader
// Add this to your main quiz loader

import harvestIndex from './data/quizzes/harvested/harvest_index.json';

export async function loadHarvestedQuizzes() {
  const quizzes = [];
  
  for (const quiz of harvestIndex.quizzes) {
    const quizData = await import(quiz.file);
    quizzes.push(quizData);
  }
  
  return quizzes;
}

// Add to your quiz categories
export const HARVESTED_CATEGORIES = harvestIndex.categories;

// Integration example:
// const harvestedQuizzes = await loadHarvestedQuizzes();
// allQuizzes.push(...harvestedQuizzes);
'''
        
        loader_path = self.output_dir / "harvest_loader.js"
        with open(loader_path, 'w') as f:
            f.write(loader_script)
        
        print(f"\n🔧 Loader script created: {loader_path}")
        print("  Copy this to your src/services/ directory for easy integration")

def main():
    """Run the integration process"""
    
    print("""
╔══════════════════════════════════════════════════════════╗
║           HARVEST → QUIZMENTOR INTEGRATION                ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    integrator = HarvestIntegrator()
    summary = integrator.generate_all_quizzes()
    
    print("\n🎯 Next Steps:")
    print("1. Copy files from data/quizzes/harvested/ to your app")
    print("2. Use harvest_loader.js to integrate with your existing quiz system")
    print("3. Test a few quizzes to ensure quality")
    print("4. Deploy to production!")
    
    print("\n💡 Tip: Run harvest again with more content for even more questions:")
    print("   python3 local_harvester.py --max-content 500 --questions-per-content 10")

if __name__ == "__main__":
    main()
