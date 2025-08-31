#!/usr/bin/env python3
"""
Validation and quality assurance agents for multi-agent quiz generation
"""

import re
import json
import requests
import random
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import numpy as np

from rich.console import Console
console = Console()

class DistractorGeneratorAgent:
    """Agent responsible for generating plausible but incorrect answer options"""
    
    def __init__(self, ollama_model: str = "llama2"):
        self.model = ollama_model
        self.distractor_strategies = {
            "common_misconception": "A common but incorrect belief",
            "partial_truth": "Partially correct but incomplete",
            "similar_concept": "Related but different concept",
            "opposite": "The opposite or inverse",
            "outdated": "Previously true but now outdated",
            "overgeneralization": "Too broad or general",
            "edge_case": "True only in specific cases",
            "confused_terminology": "Mixed up terms"
        }
    
    def process(self, blackboard_item) -> Dict[str, Any]:
        """Generate high-quality distractors for the question"""
        question = blackboard_item.data.get("question", "")
        knowledge = blackboard_item.data.get("knowledge_base", {})
        topic = blackboard_item.data.get("topic", "")
        
        if not question:
            return {
                "action": "distractor_generation_skipped",
                "confidence": 0.1,
                "reasoning": "No question available"
            }
        
        console.print("    [cyan]Generating distractors...[/cyan]")
        
        # Generate correct answer first
        correct_answer = self._generate_correct_answer(question, knowledge, topic)
        
        # Generate distractors
        distractors = self._generate_distractors(question, correct_answer, knowledge, topic)
        
        # Create answer options
        options = [correct_answer] + distractors
        random.shuffle(options)
        correct_index = options.index(correct_answer)
        
        quality = self._assess_distractor_quality(distractors, correct_answer)
        
        return {
            "action": "distractors_generated",
            "data": {
                "answer_options": options,
                "correct_index": correct_index,
                "distractor_metadata": self._create_metadata(distractors)
            },
            "updates": {
                "data": {
                    "answer_options": options,
                    "correct_answer_index": correct_index,
                    "correct_answer": correct_answer,
                    "distractors": distractors,
                    "distractor_quality": quality
                }
            },
            "confidence": 0.85,
            "quality_score": quality,
            "reasoning": f"Generated {len(distractors)} distractors with quality {quality:.2f}"
        }
    
    def _generate_correct_answer(self, question: str, knowledge: Dict[str, Any], 
                                topic: str) -> str:
        """Generate the correct answer"""
        
        # Use AI to generate correct answer
        prompt = f"""For this question about {topic}:
"{question}"

Based on the facts: {json.dumps(knowledge.get('facts', [])[:2])}

Generate the CORRECT answer (concise, accurate, complete).
Answer only with the correct option text."""
        
        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.3, "num_predict": 100}
                },
                timeout=20
            )
            
            if response.status_code == 200:
                answer = response.json().get('response', '').strip()
                if answer and len(answer) < 200:
                    return answer
        except:
            pass
        
        # Fallback
        return f"The correct implementation of {topic}"
    
    def _generate_distractors(self, question: str, correct_answer: str, 
                             knowledge: Dict[str, Any], topic: str) -> List[str]:
        """Generate plausible incorrect answers"""
        distractors = []
        
        # Use AI to generate distractors
        for strategy, description in list(self.distractor_strategies.items())[:3]:
            prompt = f"""For this question about {topic}:
"{question}"

The correct answer is: "{correct_answer}"

Generate a WRONG but plausible answer that is {description}.
Make it believable but clearly incorrect to experts.
Answer only with the distractor text."""
            
            try:
                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {"temperature": 0.8, "num_predict": 100}
                    },
                    timeout=20
                )
                
                if response.status_code == 200:
                    distractor = response.json().get('response', '').strip()
                    if distractor and len(distractor) < 200 and distractor != correct_answer:
                        distractors.append(distractor)
            except:
                pass
        
        # Ensure we have 3 distractors
        while len(distractors) < 3:
            distractors.append(self._generate_fallback_distractor(topic, correct_answer))
        
        return distractors[:3]
    
    def _generate_fallback_distractor(self, topic: str, correct_answer: str) -> str:
        """Generate a fallback distractor"""
        templates = [
            f"Using {topic} without proper configuration",
            f"Implementing {topic} with deprecated methods",
            f"Applying {topic} in inappropriate contexts",
            f"Misunderstanding the core concept of {topic}"
        ]
        return random.choice(templates)
    
    def _assess_distractor_quality(self, distractors: List[str], 
                                  correct_answer: str) -> float:
        """Assess the quality of generated distractors"""
        score = 1.0
        
        # Check for diversity
        if len(set(distractors)) < len(distractors):
            score -= 0.3
        
        # Check for appropriate length
        avg_length = np.mean([len(d) for d in distractors])
        correct_length = len(correct_answer)
        if abs(avg_length - correct_length) > 50:
            score -= 0.2
        
        # Check for too similar to correct answer
        for distractor in distractors:
            similarity = len(set(distractor.split()) & set(correct_answer.split()))
            if similarity > len(correct_answer.split()) * 0.7:
                score -= 0.2
        
        return max(0.3, min(1.0, score))
    
    def _create_metadata(self, distractors: List[str]) -> List[Dict[str, Any]]:
        """Create metadata for distractors"""
        metadata = []
        for i, distractor in enumerate(distractors):
            metadata.append({
                "text": distractor,
                "strategy": list(self.distractor_strategies.keys())[i] if i < len(self.distractor_strategies) else "fallback",
                "length": len(distractor)
            })
        return metadata

class QualityValidatorAgent:
    """Agent that validates the overall quality of questions"""
    
    def __init__(self):
        self.quality_criteria = {
            "clarity": {"weight": 0.2, "min_score": 0.6},
            "relevance": {"weight": 0.15, "min_score": 0.7},
            "difficulty_appropriate": {"weight": 0.15, "min_score": 0.6},
            "answer_quality": {"weight": 0.2, "min_score": 0.7},
            "distractor_quality": {"weight": 0.15, "min_score": 0.6},
            "educational_value": {"weight": 0.15, "min_score": 0.6}
        }
    
    def process(self, blackboard_item) -> Dict[str, Any]:
        """Validate question quality"""
        question = blackboard_item.data.get("question", "")
        options = blackboard_item.data.get("answer_options", [])
        correct_index = blackboard_item.data.get("correct_answer_index", 0)
        knowledge = blackboard_item.data.get("knowledge_base", {})
        difficulty_target = blackboard_item.data.get("difficulty_target", 3)
        
        console.print("    [cyan]Validating quality...[/cyan]")
        
        # Evaluate each criterion
        scores = {}
        scores["clarity"] = self._evaluate_clarity(question)
        scores["relevance"] = self._evaluate_relevance(question, knowledge)
        scores["difficulty_appropriate"] = self._evaluate_difficulty(question, difficulty_target)
        scores["answer_quality"] = self._evaluate_answer_quality(options, correct_index)
        scores["distractor_quality"] = self._evaluate_distractor_quality(options, correct_index)
        scores["educational_value"] = self._evaluate_educational_value(question, knowledge)
        
        # Calculate weighted score
        total_score = sum(
            scores[criterion] * self.quality_criteria[criterion]["weight"]
            for criterion in scores
        )
        
        # Check if revision needed
        needs_revision = False
        revision_reasons = []
        
        for criterion, score in scores.items():
            if score < self.quality_criteria[criterion]["min_score"]:
                needs_revision = True
                revision_reasons.append(f"{criterion}: {score:.2f}")
        
        return {
            "action": "quality_validated",
            "data": {
                "quality_scores": scores,
                "total_score": total_score,
                "needs_revision": needs_revision,
                "revision_reasons": revision_reasons
            },
            "updates": {
                "data": {
                    "quality_validation": scores,
                    "quality_total": total_score
                }
            },
            "confidence": 0.9,
            "quality_score": total_score,
            "needs_revision": needs_revision,
            "reasoning": f"Quality score: {total_score:.2f}. " + 
                        (f"Needs revision: {', '.join(revision_reasons)}" if needs_revision else "Passed validation")
        }
    
    def _evaluate_clarity(self, question: str) -> float:
        """Evaluate question clarity"""
        score = 1.0
        
        # Check length
        word_count = len(question.split())
        if word_count < 5:
            score -= 0.3
        elif word_count > 50:
            score -= 0.2
        
        # Check for ambiguous words
        ambiguous = ["thing", "stuff", "whatever", "something", "somehow"]
        for word in ambiguous:
            if word in question.lower():
                score -= 0.1
        
        # Check for proper punctuation
        if not question.strip().endswith("?"):
            score -= 0.2
        
        return max(0.0, min(1.0, score))
    
    def _evaluate_relevance(self, question: str, knowledge: Dict[str, Any]) -> float:
        """Evaluate relevance to the knowledge base"""
        score = 0.5
        
        # Check if question relates to known facts
        facts = knowledge.get("facts", [])
        question_words = set(question.lower().split())
        
        for fact in facts:
            fact_text = str(fact).lower()
            fact_words = set(fact_text.split())
            overlap = len(question_words & fact_words)
            if overlap > 2:
                score += 0.2
        
        return min(1.0, score)
    
    def _evaluate_difficulty(self, question: str, target: int) -> float:
        """Evaluate if difficulty matches target"""
        # Simple heuristic based on cognitive keywords
        cognitive_levels = {
            1: ["what", "define", "identify", "list"],
            2: ["explain", "describe", "summarize"],
            3: ["how", "apply", "implement", "use"],
            4: ["analyze", "compare", "evaluate", "why"],
            5: ["design", "create", "propose", "optimize"]
        }
        
        question_lower = question.lower()
        detected_level = 3
        
        for level, keywords in cognitive_levels.items():
            if any(kw in question_lower for kw in keywords):
                detected_level = level
                break
        
        # Score based on distance from target
        distance = abs(detected_level - target)
        return max(0.0, 1.0 - (distance * 0.25))
    
    def _evaluate_answer_quality(self, options: List[str], correct_index: int) -> float:
        """Evaluate the quality of answer options"""
        if not options or correct_index >= len(options):
            return 0.0
        
        score = 1.0
        
        # Check for empty options
        if any(not opt.strip() for opt in options):
            score -= 0.5
        
        # Check for duplicate options
        if len(set(options)) < len(options):
            score -= 0.3
        
        # Check length consistency
        lengths = [len(opt) for opt in options]
        if max(lengths) > min(lengths) * 3:
            score -= 0.2
        
        return max(0.0, score)
    
    def _evaluate_distractor_quality(self, options: List[str], correct_index: int) -> float:
        """Evaluate distractor quality"""
        if len(options) < 4:
            return 0.3
        
        distractors = [opt for i, opt in enumerate(options) if i != correct_index]
        
        score = 1.0
        
        # Check for obvious wrong answers
        obvious_wrong = ["none of the above", "all of the above", "not sure", "error"]
        for distractor in distractors:
            if any(wrong in distractor.lower() for wrong in obvious_wrong):
                score -= 0.2
        
        # Check diversity
        if len(set(d[:10] for d in distractors)) < len(distractors):
            score -= 0.2
        
        return max(0.3, score)
    
    def _evaluate_educational_value(self, question: str, knowledge: Dict[str, Any]) -> float:
        """Evaluate educational value"""
        score = 0.6
        
        # Check if testing important concepts
        important_terms = ["important", "crucial", "essential", "fundamental", "core"]
        facts = knowledge.get("facts", [])
        
        for fact in facts:
            if isinstance(fact, dict) and fact.get("importance") == "high":
                if any(word in question.lower() for word in str(fact.get("concept", "")).lower().split()):
                    score += 0.2
        
        # Check for real-world application
        if any(term in question.lower() for term in ["real", "practice", "scenario", "example"]):
            score += 0.2
        
        return min(1.0, score)

class DifficultyAssessorAgent:
    """Agent that assesses and adjusts question difficulty"""
    
    def __init__(self):
        self.difficulty_features = {
            "cognitive_complexity": 0.3,
            "knowledge_depth": 0.2,
            "answer_similarity": 0.2,
            "concept_abstraction": 0.15,
            "calculation_required": 0.15
        }
    
    def process(self, blackboard_item) -> Dict[str, Any]:
        """Assess question difficulty"""
        question = blackboard_item.data.get("question", "")
        options = blackboard_item.data.get("answer_options", [])
        knowledge = blackboard_item.data.get("knowledge_base", {})
        target_difficulty = blackboard_item.data.get("difficulty_target", 3)
        
        console.print("    [cyan]Assessing difficulty...[/cyan]")
        
        # Calculate difficulty features
        features = {}
        features["cognitive_complexity"] = self._assess_cognitive_complexity(question)
        features["knowledge_depth"] = self._assess_knowledge_depth(knowledge)
        features["answer_similarity"] = self._assess_answer_similarity(options)
        features["concept_abstraction"] = self._assess_concept_abstraction(question)
        features["calculation_required"] = self._assess_calculation_requirement(question)
        
        # Calculate overall difficulty
        assessed_difficulty = sum(
            features[f] * self.difficulty_features[f] * 5
            for f in features
        )
        
        # Round to nearest integer
        assessed_difficulty = round(assessed_difficulty)
        assessed_difficulty = max(1, min(5, assessed_difficulty))
        
        # Check if adjustment needed
        difficulty_match = abs(assessed_difficulty - target_difficulty) <= 1
        
        return {
            "action": "difficulty_assessed",
            "data": {
                "assessed_difficulty": assessed_difficulty,
                "target_difficulty": target_difficulty,
                "difficulty_features": features,
                "matches_target": difficulty_match
            },
            "updates": {
                "data": {
                    "assessed_difficulty": assessed_difficulty,
                    "difficulty_match": difficulty_match
                }
            },
            "confidence": 0.8,
            "quality_score": 0.9 if difficulty_match else 0.6,
            "needs_revision": not difficulty_match and abs(assessed_difficulty - target_difficulty) > 1,
            "reasoning": f"Assessed difficulty: {assessed_difficulty}, Target: {target_difficulty}"
        }
    
    def _assess_cognitive_complexity(self, question: str) -> float:
        """Assess cognitive complexity based on Bloom's taxonomy"""
        levels = {
            "remember": 0.2,
            "understand": 0.4,
            "apply": 0.6,
            "analyze": 0.7,
            "evaluate": 0.85,
            "create": 1.0
        }
        
        question_lower = question.lower()
        
        # Keywords for each level
        keywords = {
            "remember": ["what", "when", "where", "who", "define", "list"],
            "understand": ["explain", "describe", "summarize", "interpret"],
            "apply": ["apply", "implement", "use", "demonstrate", "solve"],
            "analyze": ["analyze", "compare", "contrast", "examine", "investigate"],
            "evaluate": ["evaluate", "judge", "assess", "critique", "justify"],
            "create": ["create", "design", "develop", "propose", "formulate"]
        }
        
        for level, words in keywords.items():
            if any(word in question_lower for word in words):
                return levels[level]
        
        return 0.5  # Default to understand level
    
    def _assess_knowledge_depth(self, knowledge: Dict[str, Any]) -> float:
        """Assess required knowledge depth"""
        depth = knowledge.get("knowledge_depth", "adequate")
        
        depth_scores = {
            "shallow": 0.3,
            "adequate": 0.5,
            "good": 0.7,
            "comprehensive": 0.9
        }
        
        return depth_scores.get(depth, 0.5)
    
    def _assess_answer_similarity(self, options: List[str]) -> float:
        """Assess how similar the answer options are"""
        if len(options) < 2:
            return 0.5
        
        # Calculate average similarity
        similarities = []
        for i in range(len(options)):
            for j in range(i + 1, len(options)):
                # Simple word overlap similarity
                words1 = set(options[i].lower().split())
                words2 = set(options[j].lower().split())
                if words1 and words2:
                    similarity = len(words1 & words2) / max(len(words1), len(words2))
                    similarities.append(similarity)
        
        if similarities:
            avg_similarity = np.mean(similarities)
            # Higher similarity = higher difficulty
            return min(1.0, avg_similarity * 1.5)
        
        return 0.5
    
    def _assess_concept_abstraction(self, question: str) -> float:
        """Assess level of abstraction"""
        abstract_terms = ["concept", "principle", "theory", "pattern", "architecture",
                         "abstraction", "paradigm", "methodology", "framework"]
        
        concrete_terms = ["code", "example", "file", "button", "screen", "data",
                         "variable", "function", "method", "class"]
        
        question_lower = question.lower()
        
        abstract_count = sum(1 for term in abstract_terms if term in question_lower)
        concrete_count = sum(1 for term in concrete_terms if term in question_lower)
        
        if abstract_count + concrete_count == 0:
            return 0.5
        
        abstraction = abstract_count / (abstract_count + concrete_count)
        return abstraction
    
    def _assess_calculation_requirement(self, question: str) -> float:
        """Check if calculation or complex reasoning is required"""
        calculation_terms = ["calculate", "compute", "determine", "solve", "derive",
                           "optimize", "algorithm", "complexity", "performance"]
        
        if any(term in question.lower() for term in calculation_terms):
            return 0.8
        
        # Check for numbers or mathematical symbols
        if re.search(r'\d+|[+\-*/=<>]', question):
            return 0.6
        
        return 0.2

class PedagogyExpertAgent:
    """Agent that ensures questions follow good pedagogical practices"""
    
    def __init__(self):
        self.pedagogical_principles = {
            "constructive_alignment": "Question aligns with learning objectives",
            "cognitive_load": "Appropriate cognitive load for learners",
            "scaffolding": "Builds on prerequisite knowledge",
            "authentic_assessment": "Tests real-world application",
            "clear_expectations": "Clear what is being assessed",
            "fair_assessment": "No tricks or gotchas"
        }
    
    def process(self, blackboard_item) -> Dict[str, Any]:
        """Evaluate pedagogical quality"""
        question = blackboard_item.data.get("question", "")
        options = blackboard_item.data.get("answer_options", [])
        knowledge = blackboard_item.data.get("knowledge_base", {})
        metadata = blackboard_item.data.get("question_metadata", {})
        
        console.print("    [cyan]Evaluating pedagogy...[/cyan]")
        
        # Evaluate principles
        evaluations = {}
        evaluations["constructive_alignment"] = self._evaluate_alignment(question, metadata)
        evaluations["cognitive_load"] = self._evaluate_cognitive_load(question, options)
        evaluations["scaffolding"] = self._evaluate_scaffolding(knowledge)
        evaluations["authentic_assessment"] = self._evaluate_authenticity(question)
        evaluations["clear_expectations"] = self._evaluate_clarity(question, options)
        evaluations["fair_assessment"] = self._evaluate_fairness(options)
        
        # Calculate overall score
        pedagogy_score = np.mean(list(evaluations.values()))
        
        # Generate improvement suggestions
        suggestions = self._generate_suggestions(evaluations)
        
        return {
            "action": "pedagogy_evaluated",
            "data": {
                "pedagogical_evaluations": evaluations,
                "pedagogy_score": pedagogy_score,
                "improvement_suggestions": suggestions
            },
            "updates": {
                "data": {
                    "pedagogy_evaluation": evaluations,
                    "pedagogy_score": pedagogy_score
                }
            },
            "confidence": 0.85,
            "quality_score": pedagogy_score,
            "needs_revision": pedagogy_score < 0.6,
            "reasoning": f"Pedagogical score: {pedagogy_score:.2f}. " + 
                        (f"Suggestions: {'; '.join(suggestions)}" if suggestions else "Good pedagogical quality")
        }
    
    def _evaluate_alignment(self, question: str, metadata: Dict[str, Any]) -> float:
        """Evaluate if question aligns with stated objectives"""
        cognitive_level = metadata.get("cognitive_level", "understand")
        question_type = metadata.get("type", "conceptual")
        
        # Check if question matches its metadata
        score = 0.7
        
        if cognitive_level in ["apply", "analyze"] and question_type in ["application", "analytical"]:
            score = 0.9
        elif cognitive_level == "understand" and question_type == "conceptual":
            score = 0.9
        
        return score
    
    def _evaluate_cognitive_load(self, question: str, options: List[str]) -> float:
        """Evaluate if cognitive load is appropriate"""
        score = 1.0
        
        # Check question complexity
        if len(question) > 200:
            score -= 0.2
        
        # Check if too many negatives
        negatives = ["not", "except", "false", "incorrect"]
        negative_count = sum(1 for neg in negatives if neg in question.lower())
        if negative_count > 1:
            score -= 0.3
        
        # Check option complexity
        avg_option_length = np.mean([len(opt) for opt in options])
        if avg_option_length > 100:
            score -= 0.2
        
        return max(0.3, score)
    
    def _evaluate_scaffolding(self, knowledge: Dict[str, Any]) -> float:
        """Evaluate if question builds on prerequisites"""
        prerequisites = knowledge.get("prerequisites", [])
        
        if prerequisites:
            return 0.8  # Has identified prerequisites
        else:
            return 0.6  # No prerequisites identified
    
    def _evaluate_authenticity(self, question: str) -> float:
        """Evaluate if question tests real-world application"""
        authentic_indicators = ["real", "practice", "scenario", "example", "case",
                               "project", "implement", "production", "actual"]
        
        if any(indicator in question.lower() for indicator in authentic_indicators):
            return 0.9
        
        return 0.5
    
    def _evaluate_clarity(self, question: str, options: List[str]) -> float:
        """Evaluate clarity of expectations"""
        score = 1.0
        
        # Check for vague terms
        vague_terms = ["might", "maybe", "could", "possibly", "sometimes"]
        for term in vague_terms:
            if term in question.lower():
                score -= 0.1
        
        # Check if all options are clear
        if any(opt.startswith("All of") or opt.startswith("None of") for opt in options):
            score -= 0.2
        
        return max(0.4, score)
    
    def _evaluate_fairness(self, options: List[str]) -> float:
        """Evaluate fairness - no tricks or gotchas"""
        score = 1.0
        
        # Check for trick options
        trick_patterns = ["always", "never", "only", "all", "none", "every"]
        for option in options:
            option_lower = option.lower()
            trick_count = sum(1 for pattern in trick_patterns if pattern in option_lower)
            if trick_count >= 2:
                score -= 0.2
        
        return max(0.5, score)
    
    def _generate_suggestions(self, evaluations: Dict[str, float]) -> List[str]:
        """Generate improvement suggestions"""
        suggestions = []
        
        for principle, score in evaluations.items():
            if score < 0.6:
                if principle == "cognitive_load":
                    suggestions.append("Simplify question or options to reduce cognitive load")
                elif principle == "authentic_assessment":
                    suggestions.append("Add real-world context or practical examples")
                elif principle == "clear_expectations":
                    suggestions.append("Remove ambiguous terms and clarify what is being asked")
                elif principle == "fair_assessment":
                    suggestions.append("Remove trick options and absolute statements")
        
        return suggestions[:3]  # Limit to top 3 suggestions

class FinalReviewerAgent:
    """Final agent that does comprehensive review and makes final decision"""
    
    def __init__(self):
        self.minimum_quality_threshold = 0.75
        self.review_checklist = [
            "question_exists",
            "has_four_options",
            "correct_answer_valid",
            "no_duplicate_options",
            "appropriate_difficulty",
            "pedagogically_sound",
            "factually_accurate"
        ]
    
    def process(self, blackboard_item) -> Dict[str, Any]:
        """Perform final comprehensive review"""
        console.print("    [cyan]Final review...[/cyan]")
        
        # Gather all quality scores
        quality_scores = {
            "quality_validation": blackboard_item.data.get("quality_total", 0),
            "distractor_quality": blackboard_item.data.get("distractor_quality", 0),
            "pedagogy_score": blackboard_item.data.get("pedagogy_score", 0),
            "difficulty_match": 1.0 if blackboard_item.data.get("difficulty_match", False) else 0.5
        }
        
        # Run checklist
        checklist_results = self._run_checklist(blackboard_item)
        
        # Calculate final score
        quality_avg = np.mean(list(quality_scores.values()))
        checklist_pass_rate = sum(checklist_results.values()) / len(checklist_results)
        final_score = quality_avg * 0.7 + checklist_pass_rate * 0.3
        
        # Make final decision
        approved = final_score >= self.minimum_quality_threshold
        
        # Generate final explanation
        explanation = self._generate_explanation(
            final_score, quality_scores, checklist_results, approved
        )
        
        return {
            "action": "final_review_completed",
            "data": {
                "final_score": final_score,
                "approved": approved,
                "quality_breakdown": quality_scores,
                "checklist_results": checklist_results,
                "explanation": explanation
            },
            "updates": {
                "data": {
                    "final_score": final_score,
                    "approved": approved,
                    "final_explanation": explanation
                }
            },
            "confidence": 0.95,
            "quality_score": final_score,
            "needs_revision": not approved and blackboard_item.revision_count < 2,
            "reasoning": explanation
        }
    
    def _run_checklist(self, blackboard_item) -> Dict[str, bool]:
        """Run through final checklist"""
        results = {}
        data = blackboard_item.data
        
        results["question_exists"] = bool(data.get("question", "").strip())
        results["has_four_options"] = len(data.get("answer_options", [])) == 4
        results["correct_answer_valid"] = 0 <= data.get("correct_answer_index", -1) < 4
        
        options = data.get("answer_options", [])
        results["no_duplicate_options"] = len(set(options)) == len(options)
        
        results["appropriate_difficulty"] = data.get("difficulty_match", False)
        results["pedagogically_sound"] = data.get("pedagogy_score", 0) >= 0.6
        results["factually_accurate"] = data.get("has_real_content", False)
        
        return results
    
    def _generate_explanation(self, final_score: float, quality_scores: Dict[str, float],
                            checklist: Dict[str, bool], approved: bool) -> str:
        """Generate explanation for final decision"""
        if approved:
            return f"Question approved with final score {final_score:.2%}. All quality criteria met."
        else:
            issues = []
            
            # Check quality scores
            for aspect, score in quality_scores.items():
                if score < 0.6:
                    issues.append(f"Low {aspect}: {score:.2f}")
            
            # Check checklist failures
            for item, passed in checklist.items():
                if not passed:
                    issues.append(f"Failed: {item}")
            
            return f"Question needs revision (score: {final_score:.2%}). Issues: {'; '.join(issues[:3])}"
