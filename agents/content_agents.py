#!/usr/bin/env python3
"""
Content-focused agents for the multi-agent quiz generation system
"""

import re
import json
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import time
from urllib.parse import urlparse, urljoin
from pathlib import Path

from rich.console import Console
console = Console()

class ContentScraperAgent:
    """Agent responsible for scraping relevant content from the web"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Educational Quiz Generator Bot)'
        })
        self.scraped_cache = {}
        
        # Documentation sources by topic
        self.doc_sources = {
            "Python": [
                "https://docs.python.org/3/tutorial/",
                "https://docs.python.org/3/library/",
                "https://realpython.com/",
            ],
            "JavaScript": [
                "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
                "https://javascript.info/",
            ],
            "AWS": [
                "https://docs.aws.amazon.com/",
                "https://aws.amazon.com/documentation/",
            ],
            "Docker": [
                "https://docs.docker.com/",
            ],
            "Kubernetes": [
                "https://kubernetes.io/docs/",
            ]
        }
    
    def process(self, blackboard_item) -> Dict[str, Any]:
        """Process a blackboard item to scrape relevant content"""
        topic = blackboard_item.data.get("topic", "")
        category = blackboard_item.data.get("category", "")
        
        console.print(f"    [cyan]Scraping content for {topic}...[/cyan]")
        
        # Check cache first
        cache_key = f"{topic}_{category}"
        if cache_key in self.scraped_cache:
            return self._create_response(self.scraped_cache[cache_key], cached=True)
        
        # Scrape content
        scraped_content = self._scrape_topic_content(topic, category)
        
        if scraped_content:
            self.scraped_cache[cache_key] = scraped_content
            
            return self._create_response(scraped_content)
        
        return {
            "action": "content_scraped",
            "data": {"error": "No content found"},
            "confidence": 0.2,
            "reasoning": f"Could not find relevant content for {topic}"
        }
    
    def _scrape_topic_content(self, topic: str, category: str) -> Dict[str, Any]:
        """Scrape content for a specific topic"""
        content = {
            "topic": topic,
            "category": category,
            "sources": [],
            "key_concepts": [],
            "code_examples": [],
            "best_practices": [],
            "common_pitfalls": []
        }
        
        # Get documentation URLs
        urls = self.doc_sources.get(topic, [])
        
        for url in urls[:2]:  # Limit to avoid overwhelming
            try:
                response = self.session.get(url, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Extract relevant content
                    extracted = self._extract_content(soup, topic)
                    
                    content["sources"].append({
                        "url": url,
                        "title": soup.find('title').text if soup.find('title') else "",
                        "content_preview": extracted.get("preview", "")
                    })
                    
                    content["key_concepts"].extend(extracted.get("concepts", []))
                    content["code_examples"].extend(extracted.get("code", []))
                    content["best_practices"].extend(extracted.get("practices", []))
                    
                time.sleep(0.5)  # Be respectful
                
            except Exception as e:
                console.print(f"      [yellow]Failed to scrape {url}: {e}[/yellow]")
        
        # Clean up duplicates
        content["key_concepts"] = list(set(content["key_concepts"]))[:10]
        content["best_practices"] = list(set(content["best_practices"]))[:5]
        
        return content
    
    def _extract_content(self, soup: BeautifulSoup, topic: str) -> Dict[str, Any]:
        """Extract relevant content from HTML"""
        extracted = {
            "preview": "",
            "concepts": [],
            "code": [],
            "practices": []
        }
        
        # Get main content
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
        
        if main_content:
            # Extract text preview
            text = main_content.get_text()[:500]
            extracted["preview"] = ' '.join(text.split())
            
            # Find headers (concepts)
            headers = main_content.find_all(['h2', 'h3', 'h4'])
            extracted["concepts"] = [h.get_text().strip() for h in headers[:10]]
            
            # Find code examples
            code_blocks = main_content.find_all(['code', 'pre'])
            extracted["code"] = [c.get_text().strip() for c in code_blocks[:5] if len(c.get_text().strip()) > 20]
            
            # Look for best practices sections
            for section in main_content.find_all(['section', 'div']):
                section_text = section.get_text().lower()
                if any(term in section_text for term in ['best practice', 'recommendation', 'tip', 'important']):
                    # Extract list items
                    items = section.find_all('li')
                    extracted["practices"].extend([i.get_text().strip() for i in items[:3]])
        
        return extracted
    
    def _create_response(self, content: Dict[str, Any], cached: bool = False) -> Dict[str, Any]:
        """Create agent response"""
        has_content = bool(content.get("sources")) and bool(content.get("key_concepts"))
        
        return {
            "action": "content_scraped",
            "data": {
                "scraped_content": content,
                "from_cache": cached
            },
            "updates": {
                "data": {
                    "scraped_content": content,
                    "has_real_content": has_content
                }
            },
            "confidence": 0.9 if has_content else 0.3,
            "reasoning": f"Scraped {len(content.get('sources', []))} sources with {len(content.get('key_concepts', []))} concepts"
        }

class KnowledgeExtractorAgent:
    """Agent that extracts structured knowledge from scraped content"""
    
    def __init__(self, ollama_model: str = "llama2"):
        self.model = ollama_model
        self.knowledge_patterns = {
            "definition": r"(?:is|are|refers to|means|defined as)\s+(.+)",
            "comparison": r"(?:unlike|whereas|compared to|differs from)\s+(.+)",
            "example": r"(?:for example|such as|like|including)\s+(.+)",
            "importance": r"(?:important|crucial|essential|key|critical)\s+(.+)",
            "relationship": r"(?:relates to|connected to|depends on|requires)\s+(.+)"
        }
    
    def process(self, blackboard_item) -> Dict[str, Any]:
        """Extract structured knowledge from content"""
        scraped_content = blackboard_item.data.get("scraped_content", {})
        
        if not scraped_content:
            return {
                "action": "knowledge_extraction_skipped",
                "confidence": 0.1,
                "reasoning": "No scraped content available"
            }
        
        console.print("    [cyan]Extracting knowledge structures...[/cyan]")
        
        # Extract knowledge
        knowledge = self._extract_knowledge(scraped_content)
        
        # Use AI to enhance extraction
        enhanced = self._enhance_with_ai(knowledge, blackboard_item.data)
        
        return {
            "action": "knowledge_extracted",
            "data": {
                "structured_knowledge": enhanced
            },
            "updates": {
                "data": {
                    "knowledge_base": enhanced,
                    "knowledge_depth": self._assess_depth(enhanced)
                }
            },
            "confidence": 0.85,
            "reasoning": f"Extracted {len(enhanced.get('facts', []))} facts and {len(enhanced.get('relationships', []))} relationships"
        }
    
    def _extract_knowledge(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Extract structured knowledge from content"""
        knowledge = {
            "facts": [],
            "definitions": [],
            "relationships": [],
            "examples": [],
            "misconceptions": [],
            "prerequisites": []
        }
        
        # Process key concepts
        for concept in content.get("key_concepts", []):
            knowledge["facts"].append({
                "concept": concept,
                "type": "key_concept",
                "source": "documentation"
            })
        
        # Process code examples
        for code in content.get("code_examples", []):
            knowledge["examples"].append({
                "code": code[:200],  # Limit length
                "type": "code_example",
                "language": content.get("topic", "unknown")
            })
        
        # Process best practices
        for practice in content.get("best_practices", []):
            knowledge["facts"].append({
                "statement": practice,
                "type": "best_practice",
                "importance": "high"
            })
        
        # Extract patterns from preview text
        preview = content.get("sources", [{}])[0].get("content_preview", "")
        if preview:
            for pattern_name, pattern in self.knowledge_patterns.items():
                matches = re.findall(pattern, preview, re.IGNORECASE)
                for match in matches[:2]:
                    if pattern_name == "definition":
                        knowledge["definitions"].append(match.strip())
                    elif pattern_name == "relationship":
                        knowledge["relationships"].append(match.strip())
        
        return knowledge
    
    def _enhance_with_ai(self, knowledge: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Use AI to enhance knowledge extraction"""
        topic = context.get("topic", "")
        
        # Create prompt for AI enhancement
        prompt = f"""Given this knowledge about {topic}, identify:
1. Common misconceptions
2. Prerequisites for understanding
3. Real-world applications

Knowledge facts: {json.dumps(knowledge['facts'][:3])}

Respond with a JSON object containing: misconceptions, prerequisites, applications (arrays)"""
        
        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.3, "num_predict": 500}
                },
                timeout=30
            )
            
            if response.status_code == 200:
                ai_response = response.json().get('response', '')
                
                # Try to parse JSON from response
                try:
                    import re
                    json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                    if json_match:
                        enhanced_data = json.loads(json_match.group())
                        
                        knowledge["misconceptions"] = enhanced_data.get("misconceptions", [])[:3]
                        knowledge["prerequisites"] = enhanced_data.get("prerequisites", [])[:3]
                        knowledge["applications"] = enhanced_data.get("applications", [])[:3]
                except:
                    pass
        except:
            pass
        
        return knowledge
    
    def _assess_depth(self, knowledge: Dict[str, Any]) -> str:
        """Assess the depth of extracted knowledge"""
        total_items = sum(len(v) for v in knowledge.values() if isinstance(v, list))
        
        if total_items > 20:
            return "comprehensive"
        elif total_items > 10:
            return "good"
        elif total_items > 5:
            return "adequate"
        else:
            return "shallow"

class QuestionCrafterAgent:
    """Agent responsible for crafting high-quality questions"""
    
    def __init__(self, ollama_model: str = "llama2"):
        self.model = ollama_model
        self.question_templates = {
            "conceptual": [
                "What is the primary purpose of {concept} in {context}?",
                "Which statement best describes {concept}?",
                "How does {concept} differ from {alternative}?"
            ],
            "application": [
                "In which scenario would you use {concept}?",
                "What is the correct way to implement {concept}?",
                "Which approach is most appropriate for {scenario}?"
            ],
            "analytical": [
                "What would happen if {condition}?",
                "Why is {concept} important for {goal}?",
                "What are the implications of {decision}?"
            ],
            "synthesis": [
                "How would you combine {concept1} and {concept2}?",
                "What solution would you propose for {problem}?",
                "Which architecture best addresses {requirements}?"
            ]
        }
    
    def process(self, blackboard_item) -> Dict[str, Any]:
        """Craft a high-quality question"""
        knowledge = blackboard_item.data.get("knowledge_base", {})
        topic = blackboard_item.data.get("topic", "")
        difficulty = blackboard_item.data.get("difficulty_target", 3)
        
        console.print("    [cyan]Crafting question...[/cyan]")
        
        # Select question type based on difficulty
        question_type = self._select_question_type(difficulty)
        
        # Craft question
        question = self._craft_question(knowledge, topic, question_type, difficulty)
        
        if question:
            return {
                "action": "question_crafted",
                "data": {
                    "question": question
                },
                "updates": {
                    "data": {
                        "question": question["text"],
                        "question_type": question["type"],
                        "question_metadata": question
                    }
                },
                "confidence": question["confidence"],
                "quality_score": question["quality"],
                "reasoning": f"Crafted {question['type']} question with confidence {question['confidence']:.2f}"
            }
        
        return {
            "action": "question_crafting_failed",
            "confidence": 0.2,
            "needs_revision": True,
            "reasoning": "Unable to craft quality question from available knowledge"
        }
    
    def _select_question_type(self, difficulty: int) -> str:
        """Select question type based on difficulty"""
        if difficulty <= 2:
            return "conceptual"
        elif difficulty == 3:
            return "application"
        elif difficulty == 4:
            return "analytical"
        else:
            return "synthesis"
    
    def _craft_question(self, knowledge: Dict[str, Any], topic: str, 
                       question_type: str, difficulty: int) -> Optional[Dict[str, Any]]:
        """Craft a question using knowledge and AI"""
        
        # Prepare context from knowledge
        facts = knowledge.get("facts", [])[:3]
        examples = knowledge.get("examples", [])[:2]
        relationships = knowledge.get("relationships", [])[:2]
        
        # Create AI prompt
        prompt = f"""Create a {question_type} multiple-choice question about {topic}.

Difficulty level: {difficulty}/5
Use these facts: {json.dumps(facts)}
Consider these relationships: {relationships}

Requirements:
- Test deep understanding, not memorization
- Make wrong answers plausible but clearly incorrect
- Include real-world context

Generate ONLY a JSON with:
{{
    "question": "the question text",
    "correct_concept": "the concept being tested",
    "cognitive_level": "remember/understand/apply/analyze/evaluate/create"
}}"""
        
        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.7, "num_predict": 300}
                },
                timeout=30
            )
            
            if response.status_code == 200:
                ai_response = response.json().get('response', '')
                
                # Parse response
                import re
                json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                if json_match:
                    question_data = json.loads(json_match.group())
                    
                    return {
                        "text": question_data.get("question", ""),
                        "type": question_type,
                        "concept": question_data.get("correct_concept", topic),
                        "cognitive_level": question_data.get("cognitive_level", "understand"),
                        "difficulty": difficulty,
                        "quality": 0.85,
                        "confidence": 0.9
                    }
        except Exception as e:
            console.print(f"      [yellow]AI generation error: {e}[/yellow]")
        
        # Fallback to template
        return self._fallback_question(topic, question_type, difficulty)
    
    def _fallback_question(self, topic: str, question_type: str, difficulty: int) -> Dict[str, Any]:
        """Create question from template as fallback"""
        import random
        
        templates = self.question_templates.get(question_type, self.question_templates["conceptual"])
        template = random.choice(templates)
        
        question_text = template.replace("{concept}", topic).replace("{context}", "modern development")
        
        return {
            "text": question_text,
            "type": question_type,
            "concept": topic,
            "cognitive_level": "understand",
            "difficulty": difficulty,
            "quality": 0.6,
            "confidence": 0.5
        }
