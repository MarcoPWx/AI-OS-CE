#!/usr/bin/env python3
"""
Quiz Question Improvement Script

This script automatically improves quiz questions by:
1. Balancing option lengths
2. Fixing format inconsistencies
3. Improving distractor quality
4. Removing semantic giveaways
"""

import json
import re
import random
from typing import List, Dict, Tuple
import statistics

class QuizImprover:
    def __init__(self, quiz_data_path: str):
        with open(quiz_data_path, 'r') as f:
            self.data = json.load(f)
        self.questions = self.data['questions']
        self.improved_count = 0
        self.improvements_log = []
        
    def improve_all_questions(self):
        """Main function to improve all questions"""
        print(f"Starting improvement of {len(self.questions)} questions...")
        
        for i, q in enumerate(self.questions):
            original_q = json.dumps(q['options'])
            improved = False
            
            # Apply improvements
            improved |= self.balance_option_lengths(q)
            improved |= self.fix_format_consistency(q)
            improved |= self.improve_distractors(q)
            improved |= self.remove_semantic_giveaways(q)
            
            if improved:
                self.improved_count += 1
                self.improvements_log.append({
                    'id': q['id'],
                    'original': original_q,
                    'improved': json.dumps(q['options'])
                })
                
            if (i + 1) % 50 == 0:
                print(f"Processed {i + 1} questions...")
        
        print(f"\nImproved {self.improved_count} questions")
        return self.data
    
    def balance_option_lengths(self, question: Dict) -> bool:
        """Balance the length of options to be within 20% of each other"""
        options = question['options']
        correct_idx = question['correctAnswer']
        
        # Calculate current lengths
        lengths = [len(opt) for opt in options]
        avg_length = statistics.mean(lengths)
        max_length = max(lengths)
        min_length = min(lengths)
        
        # Check if balancing is needed (more than 50% difference)
        if max_length > min_length * 1.5:
            improved_options = []
            target_length = int(avg_length)
            
            for i, opt in enumerate(options):
                if i == correct_idx:
                    # Handle correct answer
                    improved_opt = self.adjust_option_length(opt, target_length, is_correct=True, question=question)
                else:
                    # Handle distractors
                    improved_opt = self.adjust_option_length(opt, target_length, is_correct=False, question=question)
                improved_options.append(improved_opt)
            
            question['options'] = improved_options
            return True
        
        return False
    
    def adjust_option_length(self, option: str, target_length: int, is_correct: bool, question: Dict) -> str:
        """Adjust option length while maintaining meaning"""
        current_length = len(option)
        
        if abs(current_length - target_length) <= target_length * 0.2:
            return option  # Already within acceptable range
        
        if current_length < target_length:
            # Need to expand
            return self.expand_option(option, target_length, is_correct, question)
        else:
            # Need to shorten
            return self.shorten_option(option, target_length, is_correct, question)
    
    def expand_option(self, option: str, target_length: int, is_correct: bool, question: Dict) -> str:
        """Expand an option to reach target length"""
        # Common expansions based on question context
        expansions = {
            'TCP': 'TCP (Transmission Control Protocol)',
            'UDP': 'UDP (User Datagram Protocol)',
            'HTTP': 'HTTP (HyperText Transfer Protocol)',
            'API': 'API (Application Programming Interface)',
            'CDN': 'CDN (Content Delivery Network)',
            'VPN': 'VPN (Virtual Private Network)',
            'SQL': 'SQL (Structured Query Language)',
            'DNS': 'DNS (Domain Name System)',
            'IP': 'IP (Internet Protocol)',
            'URL': 'URL (Uniform Resource Locator)',
            'CPU': 'CPU (Central Processing Unit)',
            'RAM': 'RAM (Random Access Memory)',
            'SSD': 'SSD (Solid State Drive)',
            'OS': 'OS (Operating System)',
            'VM': 'VM (Virtual Machine)',
            'CI/CD': 'CI/CD (Continuous Integration/Deployment)',
            'REST': 'REST (Representational State Transfer)',
            'JSON': 'JSON (JavaScript Object Notation)',
            'XML': 'XML (eXtensible Markup Language)',
            'SSH': 'SSH (Secure Shell)',
            'TLS': 'TLS (Transport Layer Security)',
            'SSL': 'SSL (Secure Sockets Layer)',
            'JWT': 'JWT (JSON Web Token)',
            'CORS': 'CORS (Cross-Origin Resource Sharing)',
            'XSS': 'XSS (Cross-Site Scripting)',
            'CSRF': 'CSRF (Cross-Site Request Forgery)',
            'DDoS': 'DDoS (Distributed Denial of Service)',
            'RBAC': 'RBAC (Role-Based Access Control)',
            'OAuth': 'OAuth (Open Authorization)',
            'SAML': 'SAML (Security Assertion Markup Language)',
            'MFA': 'MFA (Multi-Factor Authentication)',
            '2FA': '2FA (Two-Factor Authentication)',
            'k8s': 'Kubernetes (k8s)',
            'AWS': 'AWS (Amazon Web Services)',
            'GCP': 'GCP (Google Cloud Platform)',
            'Azure': 'Microsoft Azure cloud platform',
        }
        
        # Try to expand abbreviations
        for abbr, full in expansions.items():
            if abbr in option and full not in option:
                option = option.replace(abbr, full)
                if len(option) >= target_length * 0.8:
                    return option
        
        # Add clarifying phrases if still too short
        if len(option) < target_length * 0.8:
            if not is_correct:
                # For wrong answers, add plausible but incorrect details
                if 'protocol' in question['question'].lower():
                    option += ' protocol'
                elif 'service' in question['question'].lower():
                    option += ' service'
                elif 'framework' in question['question'].lower():
                    option += ' framework'
                elif 'tool' in question['question'].lower():
                    option += ' tool'
                elif 'technique' in question['question'].lower():
                    option += ' technique'
                elif 'pattern' in question['question'].lower():
                    option += ' pattern'
                elif 'method' in question['question'].lower():
                    option += ' method'
                elif 'approach' in question['question'].lower():
                    option += ' approach'
                elif 'system' in question['question'].lower():
                    option += ' system'
                elif 'platform' in question['question'].lower():
                    option += ' platform'
            
        return option
    
    def shorten_option(self, option: str, target_length: int, is_correct: bool, question: Dict) -> str:
        """Shorten an option to reach target length while preserving meaning"""
        # Remove parenthetical explanations if present
        if '(' in option and ')' in option:
            # Keep the main part, remove parenthetical
            option = re.sub(r'\s*\([^)]*\)', '', option)
            if len(option) <= target_length * 1.2:
                return option
        
        # Remove "that", "which", etc.
        option = re.sub(r'\s+that\s+', ' ', option)
        option = re.sub(r'\s+which\s+', ' ', option)
        
        # Use common abbreviations
        abbreviations = {
            'Transmission Control Protocol': 'TCP',
            'User Datagram Protocol': 'UDP',
            'HyperText Transfer Protocol': 'HTTP',
            'Application Programming Interface': 'API',
            'Content Delivery Network': 'CDN',
            'Virtual Private Network': 'VPN',
            'Structured Query Language': 'SQL',
            'Domain Name System': 'DNS',
            'Internet Protocol': 'IP',
            'Continuous Integration/Continuous Deployment': 'CI/CD',
            'JavaScript Object Notation': 'JSON',
        }
        
        for full, abbr in abbreviations.items():
            if full in option:
                option = option.replace(full, abbr)
                if len(option) <= target_length * 1.2:
                    return option
        
        # If still too long, try to simplify
        if len(option) > target_length * 1.2:
            words = option.split()
            # Remove adjectives like "various", "multiple", "different"
            filter_words = ['various', 'multiple', 'different', 'specific', 'particular', 'certain']
            words = [w for w in words if w.lower() not in filter_words]
            option = ' '.join(words)
        
        return option
    
    def fix_format_consistency(self, question: Dict) -> bool:
        """Ensure consistent formatting across all options"""
        options = question['options']
        improved = False
        
        # Check capitalization pattern
        capital_counts = [sum(1 for c in opt if c.isupper()) for opt in options]
        if max(capital_counts) > 0 and min(capital_counts) == 0:
            # Inconsistent capitalization
            # Make all options follow sentence case
            for i in range(len(options)):
                if options[i] and options[i][0].islower():
                    options[i] = options[i][0].upper() + options[i][1:]
            improved = True
        
        # Check punctuation at the end
        has_period = [opt.endswith('.') for opt in options]
        if any(has_period) and not all(has_period):
            # Inconsistent - remove all periods for consistency
            for i in range(len(options)):
                options[i] = options[i].rstrip('.')
            improved = True
        
        # Check for consistent article usage (a/an/the)
        starts_with_article = [opt.lower().startswith(('a ', 'an ', 'the ')) for opt in options]
        if sum(starts_with_article) in [1, 3]:  # One different from others
            # Either all should have articles or none
            if sum(starts_with_article) >= 2:
                # Add articles to those missing
                for i in range(len(options)):
                    if not starts_with_article[i]:
                        # Determine appropriate article
                        first_word = options[i].split()[0] if options[i].split() else ""
                        if first_word and first_word[0].lower() in 'aeiou':
                            options[i] = "An " + options[i]
                        else:
                            options[i] = "A " + options[i]
            else:
                # Remove articles from all
                for i in range(len(options)):
                    if starts_with_article[i]:
                        options[i] = re.sub(r'^(a|an|the)\s+', '', options[i], flags=re.IGNORECASE)
                        if options[i]:
                            options[i] = options[i][0].upper() + options[i][1:]
            improved = True
        
        if improved:
            question['options'] = options
        
        return improved
    
    def improve_distractors(self, question: Dict) -> bool:
        """Replace poor quality distractors with better ones"""
        q_text = question['question'].lower()
        options = question['options']
        correct_idx = question['correctAnswer']
        improved = False
        
        # Category-specific distractor improvements
        category = question.get('categorySlug', '')
        
        for i, opt in enumerate(options):
            if i == correct_idx:
                continue  # Don't modify correct answer
            
            opt_lower = opt.lower()
            
            # Check for joke answers
            joke_indicators = ['joke', 'funny', 'silly', 'taste better', 'magic', 'unicorn', 'random']
            if any(indicator in opt_lower for indicator in joke_indicators):
                # Replace with plausible distractor
                options[i] = self.generate_plausible_distractor(question, i)
                improved = True
                continue
            
            # Check for "none" type answers when not appropriate
            if not any(word in q_text for word in ['which', 'what', 'how many']):
                none_patterns = ['there is no', 'none of', 'neither', 'they are the same']
                if any(pattern in opt_lower for pattern in none_patterns):
                    options[i] = self.generate_plausible_distractor(question, i)
                    improved = True
                    continue
            
            # Check for completely unrelated answers
            q_words = set(word for word in q_text.split() if len(word) > 3)
            opt_words = set(word for word in opt_lower.split() if len(word) > 3)
            
            if not q_words & opt_words and len(opt) < 20:
                # Too short and unrelated
                options[i] = self.generate_plausible_distractor(question, i)
                improved = True
        
        if improved:
            question['options'] = options
        
        return improved
    
    def generate_plausible_distractor(self, question: Dict, index: int) -> str:
        """Generate a plausible but incorrect distractor based on the question context"""
        q_text = question['question'].lower()
        correct_answer = question['options'][question['correctAnswer']]
        category = question.get('categorySlug', '')
        
        # Common distractors by topic
        distractors_by_topic = {
            'networking': {
                'protocol': ['A network routing protocol', 'A data compression protocol', 'A security encryption protocol',
                           'A file transfer protocol', 'A message queuing protocol', 'A session management protocol'],
                'port': ['22', '25', '53', '110', '143', '389', '636', '993', '995', '1433', '3306', '5432', '5672', '6379', '8000', '8080', '8443', '9000'],
                'tcp/udp': ['TCP is connectionless, UDP is connection-oriented', 'TCP is faster for streaming, UDP for file transfer',
                          'TCP uses encryption, UDP does not', 'TCP is newer than UDP', 'TCP works on layer 2, UDP on layer 3'],
                'http': ['A binary protocol for data transfer', 'A protocol for email transmission', 'A database query protocol',
                        'A real-time streaming protocol', 'A peer-to-peer file sharing protocol'],
                'cdn': ['A database replication service', 'A load balancing algorithm', 'A web application framework',
                       'A cloud storage solution', 'A network monitoring tool', 'A content management system'],
                'dns': ['A web server software', 'A firewall configuration', 'A network routing protocol',
                       'A content delivery system', 'A database management system', 'An email server protocol'],
            },
            'containers': {
                'docker': ['A virtual machine hypervisor', 'A cloud orchestration platform', 'A continuous integration tool',
                          'A configuration management system', 'A monitoring and logging platform', 'A source code repository'],
                'kubernetes': ['A Docker container runtime', 'A cloud provider service', 'A service mesh implementation',
                             'A container registry', 'A CI/CD pipeline tool', 'A infrastructure provisioning tool'],
                'pod': ['A Docker container group', 'A Kubernetes namespace', 'A persistent storage volume',
                       'A network policy object', 'A service endpoint', 'A configuration map'],
                'container': ['A lightweight virtual machine', 'A code packaging format', 'A cloud deployment unit',
                            'A microservice architecture', 'A serverless function', 'An application binary'],
            },
            'security': {
                'authentication': ['A data encryption method', 'An access control list', 'A network firewall rule',
                                 'A password hashing algorithm', 'A digital signature scheme', 'A certificate authority'],
                'encryption': ['A compression algorithm', 'An authentication protocol', 'A hashing function',
                             'A digital signature', 'A key exchange method', 'An access control mechanism'],
                'oauth': ['An encryption standard', 'An authentication protocol', 'A password manager',
                        'A single sign-on solution', 'A certificate authority', 'A security audit tool'],
                'sql injection': ['A database optimization technique', 'A query performance tool', 'A data migration method',
                                'A backup and recovery process', 'A database replication attack', 'A cache poisoning technique'],
                'xss': ['A CSS preprocessor', 'A JavaScript framework', 'A browser security policy',
                       'A content filtering system', 'A session hijacking method', 'A DNS spoofing attack'],
                'csrf': ['A secure coding standard', 'A penetration testing tool', 'A vulnerability scanner',
                        'A security audit framework', 'A browser same-origin policy', 'A cookie stealing technique'],
            },
            'database': {
                'sql': ['A NoSQL query language', 'A data serialization format', 'A database migration tool',
                       'A schema design pattern', 'A transaction log format', 'A replication protocol'],
                'index': ['A database backup file', 'A query execution plan', 'A transaction log',
                        'A table partition', 'A database trigger', 'A stored procedure'],
                'transaction': ['A database backup', 'A query optimization', 'A data migration',
                              'A schema update', 'A replication event', 'A cache refresh'],
                'nosql': ['A SQL optimization technique', 'A relational database type', 'A query language standard',
                        'A database sharding method', 'A transaction protocol', 'A schema migration tool'],
            },
            'cloud': {
                'aws': ['A container orchestration service', 'A database management platform', 'A CI/CD pipeline tool',
                       'A monitoring and logging service', 'A configuration management system', 'A source control service'],
                'serverless': ['A container platform', 'A virtual machine service', 'A database hosting solution',
                             'A content delivery network', 'A load balancing service', 'A message queue system'],
                'scaling': ['Adding more CPU cores', 'Increasing network bandwidth', 'Optimizing database queries',
                          'Implementing caching layers', 'Using CDN for static assets', 'Upgrading to SSD storage'],
            },
            'devops': {
                'ci/cd': ['A version control system', 'A container orchestration platform', 'A monitoring solution',
                        'A configuration management tool', 'An infrastructure provisioning system', 'A log aggregation service'],
                'git': ['A continuous integration tool', 'A code review platform', 'A project management system',
                       'A documentation generator', 'A dependency manager', 'A testing framework'],
                'monitoring': ['A deployment automation tool', 'A container orchestration system', 'A CI/CD pipeline',
                             'A configuration management platform', 'A service mesh', 'A secret management system'],
            }
        }
        
        # Extract topic from question
        topic = None
        topic_keywords = {
            'networking': ['tcp', 'udp', 'http', 'dns', 'cdn', 'port', 'protocol', 'network', 'ip', 'ssl', 'tls'],
            'containers': ['docker', 'container', 'kubernetes', 'k8s', 'pod', 'image', 'registry', 'orchestration'],
            'security': ['security', 'auth', 'oauth', 'encryption', 'password', 'csrf', 'xss', 'sql injection', 'attack'],
            'database': ['database', 'sql', 'query', 'index', 'transaction', 'nosql', 'mongodb', 'postgres', 'mysql'],
            'cloud': ['aws', 'azure', 'gcp', 'cloud', 'serverless', 'lambda', 's3', 'ec2', 'scaling'],
            'devops': ['ci/cd', 'devops', 'git', 'deployment', 'pipeline', 'monitoring', 'logging', 'automation'],
        }
        
        for topic_name, keywords in topic_keywords.items():
            if any(keyword in q_text for keyword in keywords):
                topic = topic_name
                break
        
        if not topic:
            # Default topic based on category
            if 'network' in category:
                topic = 'networking'
            elif 'container' in category or 'docker' in category or 'k8s' in category:
                topic = 'containers'
            elif 'security' in category or 'auth' in category:
                topic = 'security'
            elif 'database' in category or 'sql' in category:
                topic = 'database'
            elif 'cloud' in category or 'aws' in category:
                topic = 'cloud'
            elif 'devops' in category or 'cicd' in category:
                topic = 'devops'
            else:
                topic = 'networking'  # Default fallback
        
        # Find subtopic
        subtopic = None
        for keyword in topic_keywords.get(topic, []):
            if keyword in q_text:
                subtopic = keyword
                break
        
        # Get appropriate distractors
        topic_distractors = distractors_by_topic.get(topic, {})
        
        # Try to find distractors for the specific subtopic
        if subtopic and subtopic in topic_distractors:
            distractor_pool = topic_distractors[subtopic]
        else:
            # Use all distractors from the topic
            distractor_pool = []
            for distractors in topic_distractors.values():
                distractor_pool.extend(distractors)
        
        # Filter out distractors that are too similar to correct answer
        correct_lower = correct_answer.lower()
        filtered_pool = [d for d in distractor_pool if not any(word in d.lower() for word in correct_lower.split() if len(word) > 4)]
        
        if filtered_pool:
            # Return a random distractor from the pool
            return random.choice(filtered_pool)
        else:
            # Fallback: generate based on question structure
            if 'what is' in q_text:
                return f"A {topic} management tool"
            elif 'what does' in q_text:
                return f"Manages {topic} operations"
            elif 'which' in q_text:
                return f"The {topic} configuration option"
            elif 'how' in q_text:
                return f"By using {topic} optimization"
            else:
                return f"A {topic} implementation"
    
    def remove_semantic_giveaways(self, question: Dict) -> bool:
        """Remove patterns that make correct answers obvious"""
        options = question['options']
        correct_idx = question['correctAnswer']
        correct_answer = options[correct_idx]
        improved = False
        
        # Check if correct answer is too comprehensive
        comprehensive_words = ['and', 'both', 'all', 'including', 'with', 'as well as', 'multiple', 'various']
        correct_comprehensive = sum(1 for word in comprehensive_words if word in correct_answer.lower())
        
        if correct_comprehensive > 0:
            # Check if distractors lack these
            distractor_comprehensive = []
            for i, opt in enumerate(options):
                if i != correct_idx:
                    count = sum(1 for word in comprehensive_words if word in opt.lower())
                    distractor_comprehensive.append(count)
            
            if max(distractor_comprehensive) == 0:
                # Add comprehensive elements to 1-2 distractors
                for i, opt in enumerate(options):
                    if i != correct_idx and random.random() < 0.5:
                        # Add "and" with another plausible element
                        if 'protocol' in opt.lower():
                            options[i] = opt + " and related standards"
                        elif 'service' in opt.lower():
                            options[i] = opt + " with integrated features"
                        elif 'tool' in opt.lower():
                            options[i] = opt + " and associated utilities"
                        elif 'system' in opt.lower():
                            options[i] = opt + " including subsystems"
                        else:
                            options[i] = opt + " and extensions"
                        improved = True
        
        # Remove hedging language from distractors
        hedge_words = ['maybe', 'sometimes', 'possibly', 'might', 'could', 'perhaps', 'usually', 'often']
        for i, opt in enumerate(options):
            if i != correct_idx:
                for hedge in hedge_words:
                    if hedge in opt.lower():
                        # Remove hedging
                        options[i] = re.sub(r'\b' + hedge + r'\b\s*', '', opt, flags=re.IGNORECASE)
                        improved = True
        
        # Remove absolute terms from distractors (they're often wrong)
        absolute_words = ['always', 'never', 'only', 'every', 'none', 'all']
        for i, opt in enumerate(options):
            if i != correct_idx:
                for absolute in absolute_words:
                    if absolute in opt.lower() and absolute not in correct_answer.lower():
                        # Replace with less absolute terms
                        replacements = {
                            'always': 'typically',
                            'never': 'rarely',
                            'only': 'primarily',
                            'every': 'most',
                            'none': 'few',
                            'all': 'most'
                        }
                        for orig, repl in replacements.items():
                            options[i] = re.sub(r'\b' + orig + r'\b', repl, options[i], flags=re.IGNORECASE)
                        improved = True
        
        if improved:
            question['options'] = options
        
        return improved
    
    def save_improved_quiz(self, output_path: str):
        """Save the improved quiz data"""
        with open(output_path, 'w') as f:
            json.dump(self.data, f, indent=2)
        print(f"Saved improved quiz to {output_path}")
    
    def generate_improvement_report(self):
        """Generate a report of improvements made"""
        report = []
        report.append("QUIZ IMPROVEMENT REPORT")
        report.append("=" * 50)
        report.append(f"Total questions processed: {len(self.questions)}")
        report.append(f"Questions improved: {self.improved_count}")
        report.append(f"Improvement rate: {self.improved_count/len(self.questions)*100:.1f}%")
        report.append("")
        
        if self.improvements_log:
            report.append("Sample improvements (first 5):")
            report.append("-" * 50)
            for log in self.improvements_log[:5]:
                report.append(f"Question ID: {log['id']}")
                report.append(f"Original: {log['original']}")
                report.append(f"Improved: {log['improved']}")
                report.append("")
        
        return "\n".join(report)

def main():
    # Create backup of original data
    import shutil
    backup_path = '/Users/betolbook/Documents/github/NatureQuest/QuizMentor/data/quiz-data-backup.json'
    original_path = '/Users/betolbook/Documents/github/NatureQuest/QuizMentor/data/quiz-data.json'
    
    print("Creating backup of original quiz data...")
    shutil.copy2(original_path, backup_path)
    print(f"Backup saved to {backup_path}")
    
    # Improve quiz questions
    improver = QuizImprover(original_path)
    improved_data = improver.improve_all_questions()
    
    # Save improved version
    improver.save_improved_quiz(original_path)
    
    # Generate report
    report = improver.generate_improvement_report()
    print("\n" + report)
    
    # Save report to file
    report_path = '/Users/betolbook/Documents/github/NatureQuest/QuizMentor/improvement_report.txt'
    with open(report_path, 'w') as f:
        f.write(report)
    print(f"\nDetailed report saved to {report_path}")

if __name__ == "__main__":
    main()
