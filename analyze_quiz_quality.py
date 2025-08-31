#!/usr/bin/env python3
"""
Quiz Question Quality Analyzer

This script analyzes quiz questions to identify cases where the correct answer
might be too obvious compared to the distractors (wrong options).

Checks for:
1. Length patterns - correct answer significantly longer/shorter
2. Formatting differences - capitalization, punctuation patterns
3. Technical accuracy - distractors that are obviously wrong
4. Semantic patterns - correct answer being more detailed/comprehensive
5. Grammar/style consistency
"""

import json
import re
import statistics
from typing import List, Dict, Tuple
from collections import defaultdict

class QuizQualityAnalyzer:
    def __init__(self, quiz_data_path: str):
        with open(quiz_data_path, 'r') as f:
            self.data = json.load(f)
        self.questions = self.data['questions']
        self.issues = []
        
    def analyze_all_questions(self):
        """Main analysis function that runs all checks"""
        print(f"Analyzing {len(self.questions)} questions...")
        print("-" * 80)
        
        length_issues = []
        format_issues = []
        semantic_issues = []
        obvious_issues = []
        
        for q in self.questions:
            question_id = q['id']
            question_text = q['question']
            options = q['options']
            
            # Handle both 'correctAnswer' and 'correct' field names
            if 'correctAnswer' in q:
                correct_idx = q['correctAnswer']
            elif 'correct' in q:
                correct_idx = q['correct']
            else:
                print(f"Warning: Question {question_id} missing correct answer field, skipping...")
                continue
                
            # Ensure correct_idx is valid
            if correct_idx >= len(options):
                print(f"Warning: Question {question_id} has invalid correct answer index {correct_idx}, skipping...")
                continue
                
            correct_answer = options[correct_idx]
            wrong_answers = [opt for i, opt in enumerate(options) if i != correct_idx]
            
            # Check 1: Length patterns
            length_issue = self.check_length_patterns(question_id, correct_answer, wrong_answers)
            if length_issue:
                length_issues.append((question_id, question_text, options, correct_idx, length_issue))
            
            # Check 2: Format patterns
            format_issue = self.check_format_patterns(question_id, correct_answer, wrong_answers, options)
            if format_issue:
                format_issues.append((question_id, question_text, options, correct_idx, format_issue))
            
            # Check 3: Semantic patterns
            semantic_issue = self.check_semantic_patterns(question_id, correct_answer, wrong_answers)
            if semantic_issue:
                semantic_issues.append((question_id, question_text, options, correct_idx, semantic_issue))
            
            # Check 4: Obviously wrong distractors
            obvious_issue = self.check_obvious_distractors(question_id, question_text, correct_answer, wrong_answers)
            if obvious_issue:
                obvious_issues.append((question_id, question_text, options, correct_idx, obvious_issue))
        
        # Print summary report
        self.print_report(length_issues, format_issues, semantic_issues, obvious_issues)
        
        # Return detailed issues for potential fixes
        return {
            'length_issues': length_issues,
            'format_issues': format_issues,
            'semantic_issues': semantic_issues,
            'obvious_issues': obvious_issues
        }
    
    def check_length_patterns(self, qid: str, correct: str, wrong: List[str]) -> str:
        """Check if correct answer has significantly different length"""
        correct_len = len(correct)
        wrong_lens = [len(w) for w in wrong]
        avg_wrong_len = statistics.mean(wrong_lens)
        
        # Check if correct is >50% longer or shorter than average wrong
        if correct_len > avg_wrong_len * 1.5:
            return f"Correct answer is {correct_len/avg_wrong_len:.1f}x longer than distractors"
        elif correct_len < avg_wrong_len * 0.67:
            return f"Correct answer is {correct_len/avg_wrong_len:.1f}x shorter than distractors"
        
        # Check if correct is outlier in length
        all_lens = wrong_lens + [correct_len]
        std_dev = statistics.stdev(all_lens) if len(all_lens) > 1 else 0
        if std_dev > 0:
            z_score = abs(correct_len - statistics.mean(all_lens)) / std_dev
            if z_score > 2:
                return f"Correct answer length is statistical outlier (z-score: {z_score:.1f})"
        
        return None
    
    def check_format_patterns(self, qid: str, correct: str, wrong: List[str], all_options: List[str]) -> str:
        """Check for formatting differences that make correct answer stand out"""
        issues = []
        
        # Check capitalization patterns
        correct_caps = sum(1 for c in correct if c.isupper())
        wrong_caps = [sum(1 for c in w if c.isupper()) for w in wrong]
        
        if correct_caps > 0 and all(wc == 0 for wc in wrong_caps):
            issues.append("Only correct answer contains capital letters")
        
        # Check punctuation patterns
        correct_punct = bool(re.search(r'[.,;:!?]', correct))
        wrong_punct = [bool(re.search(r'[.,;:!?]', w)) for w in wrong]
        
        if correct_punct and not any(wrong_punct):
            issues.append("Only correct answer contains punctuation")
        elif not correct_punct and all(wrong_punct):
            issues.append("Only correct answer lacks punctuation")
        
        # Check for technical terms/jargon
        tech_pattern = r'\b[A-Z]{2,}\b|\b\w+\(\)|\b\d+\.\d+'
        correct_tech = bool(re.search(tech_pattern, correct))
        wrong_tech = [bool(re.search(tech_pattern, w)) for w in wrong]
        
        if correct_tech and not any(wrong_tech):
            issues.append("Only correct answer contains technical notation")
        
        # Check if correct answer starts differently
        correct_start = correct.split()[0] if correct.split() else ""
        wrong_starts = [w.split()[0] if w.split() else "" for w in wrong]
        
        if correct_start and all(correct_start.lower() != ws.lower() for ws in wrong_starts):
            # Check if pattern is consistent (e.g., all wrong start with "To" but correct doesn't)
            if len(set(ws.lower() for ws in wrong_starts)) == 1 and wrong_starts[0]:
                issues.append(f"Distractors all start with '{wrong_starts[0]}', correct doesn't")
        
        return "; ".join(issues) if issues else None
    
    def check_semantic_patterns(self, qid: str, correct: str, wrong: List[str]) -> str:
        """Check for semantic patterns that make correct answer obvious"""
        issues = []
        
        # Check if correct answer is more comprehensive (contains "and", "both", "all")
        comprehensive_words = ['and', 'both', 'all', 'including', 'with', 'multiple', 'various']
        correct_comprehensive = any(word in correct.lower() for word in comprehensive_words)
        wrong_comprehensive = [any(word in w.lower() for word in comprehensive_words) for w in wrong]
        
        if correct_comprehensive and not any(wrong_comprehensive):
            issues.append("Correct answer appears more comprehensive/complete")
        
        # Check for hedging language in wrong answers
        hedge_words = ['maybe', 'sometimes', 'possibly', 'might', 'could', 'perhaps']
        correct_hedged = any(word in correct.lower() for word in hedge_words)
        wrong_hedged = [any(word in w.lower() for word in hedge_words) for w in wrong]
        
        if not correct_hedged and sum(wrong_hedged) >= 2:
            issues.append("Multiple distractors use hedging language")
        
        # Check for absolute terms
        absolute_words = ['always', 'never', 'only', 'all', 'none', 'every']
        wrong_absolute = [any(word in w.lower() for word in absolute_words) for w in wrong]
        
        if sum(wrong_absolute) >= 2:
            issues.append("Multiple distractors use absolute terms (often wrong)")
        
        return "; ".join(issues) if issues else None
    
    def check_obvious_distractors(self, qid: str, question: str, correct: str, wrong: List[str]) -> str:
        """Check for distractors that are obviously wrong or irrelevant"""
        issues = []
        
        # Check for joke/silly answers
        joke_indicators = ['joke', 'funny', 'silly', 'taste better', 'magic', 'unicorn']
        for i, w in enumerate(wrong):
            if any(indicator in w.lower() for indicator in joke_indicators):
                issues.append(f"Distractor {i+1} appears to be a joke answer")
        
        # Check for completely unrelated answers (based on question keywords)
        question_lower = question.lower()
        
        # Extract key technical terms from question
        tech_terms = re.findall(r'\b[A-Z]{2,}\b|\b\w+[-]\w+\b', question)
        
        # Check if distractors are completely unrelated
        unrelated_count = 0
        for w in wrong:
            w_lower = w.lower()
            # Check if distractor shares any meaningful words with question
            question_words = set(word for word in question_lower.split() if len(word) > 3)
            distractor_words = set(word for word in w_lower.split() if len(word) > 3)
            
            # Very rough heuristic: if no overlap and short answer, might be unrelated
            if not question_words & distractor_words and len(w) < 20:
                unrelated_count += 1
        
        if unrelated_count >= 2:
            issues.append(f"{unrelated_count} distractors seem unrelated to question")
        
        # Check for "None of the above" type answers when not appropriate
        none_patterns = ['none', 'neither', 'not', 'no difference', 'there is no']
        none_answers = [w for w in wrong if any(p in w.lower() for p in none_patterns)]
        if len(none_answers) >= 2:
            issues.append("Multiple negative/none-type distractors")
        
        return "; ".join(issues) if issues else None
    
    def print_report(self, length_issues, format_issues, semantic_issues, obvious_issues):
        """Print a formatted report of findings"""
        total_issues = len(length_issues) + len(format_issues) + len(semantic_issues) + len(obvious_issues)
        
        print("\n" + "=" * 80)
        print("QUIZ QUALITY ANALYSIS REPORT")
        print("=" * 80)
        
        print(f"\nTotal questions analyzed: {len(self.questions)}")
        print(f"Questions with potential issues: {len(set([i[0] for i in length_issues + format_issues + semantic_issues + obvious_issues]))}")
        print(f"Total issues found: {total_issues}")
        
        print("\n" + "-" * 80)
        print("ISSUE BREAKDOWN:")
        print("-" * 80)
        
        print(f"\n1. LENGTH PATTERN ISSUES: {len(length_issues)} questions")
        if length_issues:
            for i, (qid, question, options, correct_idx, issue) in enumerate(length_issues[:5]):
                print(f"\n   [{qid}] {question[:60]}...")
                print(f"   Issue: {issue}")
                print(f"   Correct: '{options[correct_idx]}'")
                if i >= 4 and len(length_issues) > 5:
                    print(f"   ... and {len(length_issues) - 5} more")
                    break
        
        print(f"\n2. FORMAT PATTERN ISSUES: {len(format_issues)} questions")
        if format_issues:
            for i, (qid, question, options, correct_idx, issue) in enumerate(format_issues[:5]):
                print(f"\n   [{qid}] {question[:60]}...")
                print(f"   Issue: {issue}")
                print(f"   Options:")
                for j, opt in enumerate(options):
                    marker = "✓" if j == correct_idx else "✗"
                    print(f"     {marker} {opt}")
                if i >= 4 and len(format_issues) > 5:
                    print(f"   ... and {len(format_issues) - 5} more")
                    break
        
        print(f"\n3. SEMANTIC PATTERN ISSUES: {len(semantic_issues)} questions")
        if semantic_issues:
            for i, (qid, question, options, correct_idx, issue) in enumerate(semantic_issues[:5]):
                print(f"\n   [{qid}] {question[:60]}...")
                print(f"   Issue: {issue}")
                if i >= 4 and len(semantic_issues) > 5:
                    print(f"   ... and {len(semantic_issues) - 5} more")
                    break
        
        print(f"\n4. OBVIOUS DISTRACTOR ISSUES: {len(obvious_issues)} questions")
        if obvious_issues:
            for i, (qid, question, options, correct_idx, issue) in enumerate(obvious_issues[:5]):
                print(f"\n   [{qid}] {question[:60]}...")
                print(f"   Issue: {issue}")
                print(f"   Options:")
                for j, opt in enumerate(options):
                    marker = "✓" if j == correct_idx else "✗"
                    print(f"     {marker} {opt}")
                if i >= 4 and len(obvious_issues) > 5:
                    print(f"   ... and {len(obvious_issues) - 5} more")
                    break
        
        print("\n" + "=" * 80)
        print("RECOMMENDATIONS:")
        print("=" * 80)
        
        if total_issues > 0:
            print("\n1. Review questions with length disparities - ensure all options are similar length")
            print("2. Check formatting consistency across all options")
            print("3. Avoid joke/silly distractors that are obviously wrong")
            print("4. Make distractors plausible and related to the question topic")
            print("5. Avoid patterns where correct answer is always most detailed/comprehensive")
            print("6. Ensure grammatical consistency across all options")
        else:
            print("\nNo significant issues detected! Quiz questions appear well-balanced.")
        
        print("\n" + "=" * 80)
        
        # Generate CSV report for detailed review
        self.generate_csv_report(length_issues, format_issues, semantic_issues, obvious_issues)
    
    def generate_csv_report(self, length_issues, format_issues, semantic_issues, obvious_issues):
        """Generate a CSV file with all flagged questions for manual review"""
        import csv
        
        csv_path = '/Users/betolbook/Documents/github/NatureQuest/QuizMentor/quiz_quality_report.csv'
        
        all_issues = {}
        
        # Compile all issues by question ID
        for qid, question, options, correct_idx, issue in length_issues:
            if qid not in all_issues:
                all_issues[qid] = {
                    'question': question,
                    'options': options,
                    'correct_idx': correct_idx,
                    'issues': []
                }
            all_issues[qid]['issues'].append(f"LENGTH: {issue}")
        
        for qid, question, options, correct_idx, issue in format_issues:
            if qid not in all_issues:
                all_issues[qid] = {
                    'question': question,
                    'options': options,
                    'correct_idx': correct_idx,
                    'issues': []
                }
            all_issues[qid]['issues'].append(f"FORMAT: {issue}")
        
        for qid, question, options, correct_idx, issue in semantic_issues:
            if qid not in all_issues:
                all_issues[qid] = {
                    'question': question,
                    'options': options,
                    'correct_idx': correct_idx,
                    'issues': []
                }
            all_issues[qid]['issues'].append(f"SEMANTIC: {issue}")
        
        for qid, question, options, correct_idx, issue in obvious_issues:
            if qid not in all_issues:
                all_issues[qid] = {
                    'question': question,
                    'options': options,
                    'correct_idx': correct_idx,
                    'issues': []
                }
            all_issues[qid]['issues'].append(f"OBVIOUS: {issue}")
        
        # Write to CSV
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['Question ID', 'Question', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 
                         'Correct Answer Index', 'Issues Found']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for qid, data in sorted(all_issues.items()):
                writer.writerow({
                    'Question ID': qid,
                    'Question': data['question'],
                    'Option 1': data['options'][0] if len(data['options']) > 0 else '',
                    'Option 2': data['options'][1] if len(data['options']) > 1 else '',
                    'Option 3': data['options'][2] if len(data['options']) > 2 else '',
                    'Option 4': data['options'][3] if len(data['options']) > 3 else '',
                    'Correct Answer Index': data['correct_idx'] + 1,  # Make it 1-indexed for readability
                    'Issues Found': ' | '.join(data['issues'])
                })
        
        print(f"\nDetailed CSV report saved to: {csv_path}")

if __name__ == "__main__":
    analyzer = QuizQualityAnalyzer('/Users/betolbook/Documents/github/NatureQuest/QuizMentor/data/quiz-data.json')
    results = analyzer.analyze_all_questions()
