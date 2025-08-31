import { Question } from '../types/domain';

/**
 * Bloom's Taxonomy Validator and Classifier
 * Ensures pedagogical alignment of questions with educational objectives
 * Based on the revised Bloom's Taxonomy (Anderson & Krathwohl, 2001)
 */

export interface BloomLevel {
  level: number;
  name: string;
  description: string;
  keywords: string[];
  cognitiveProcess: string[];
  assessmentTypes: string[];
  learningObjectives: string[];
}

export interface TaxonomyValidation {
  isValid: boolean;
  level: BloomLevel;
  confidence: number;
  suggestions: string[];
  pedagogicalAlignment: number;
  cognitiveComplexity: number;
}

export interface QuestionClassification {
  primaryLevel: BloomLevel;
  secondaryLevels: BloomLevel[];
  knowledgeDimension: KnowledgeDimension;
  cognitiveLoad: number;
  educationalValue: number;
}

export type KnowledgeDimension = 'factual' | 'conceptual' | 'procedural' | 'metacognitive';

export class BloomsTaxonomyValidator {
  private static instance: BloomsTaxonomyValidator;

  // Bloom's Taxonomy Levels (Revised)
  private readonly taxonomyLevels: BloomLevel[] = [
    {
      level: 1,
      name: 'Remember',
      description: 'Retrieve relevant knowledge from long-term memory',
      keywords: [
        'define',
        'list',
        'recall',
        'recognize',
        'identify',
        'name',
        'describe',
        'retrieve',
        'locate',
        'find',
      ],
      cognitiveProcess: ['recognizing', 'recalling'],
      assessmentTypes: ['multiple-choice', 'true-false', 'matching', 'fill-in-blank'],
      learningObjectives: [
        'recall facts',
        'recognize concepts',
        'identify elements',
        'retrieve information',
      ],
    },
    {
      level: 2,
      name: 'Understand',
      description: 'Construct meaning from instructional messages',
      keywords: [
        'explain',
        'summarize',
        'paraphrase',
        'classify',
        'compare',
        'interpret',
        'exemplify',
        'infer',
        'categorize',
      ],
      cognitiveProcess: [
        'interpreting',
        'exemplifying',
        'classifying',
        'summarizing',
        'inferring',
        'comparing',
        'explaining',
      ],
      assessmentTypes: ['short-answer', 'essay', 'discussion', 'concept-mapping'],
      learningObjectives: [
        'explain ideas',
        'classify concepts',
        'compare elements',
        'summarize information',
      ],
    },
    {
      level: 3,
      name: 'Apply',
      description: 'Carry out or use a procedure in a given situation',
      keywords: [
        'apply',
        'execute',
        'implement',
        'solve',
        'use',
        'demonstrate',
        'operate',
        'carry out',
        'practice',
      ],
      cognitiveProcess: ['executing', 'implementing'],
      assessmentTypes: ['problem-solving', 'case-study', 'simulation', 'demonstration'],
      learningObjectives: [
        'apply knowledge',
        'solve problems',
        'use procedures',
        'implement solutions',
      ],
    },
    {
      level: 4,
      name: 'Analyze',
      description: 'Break material into parts and determine relationships',
      keywords: [
        'analyze',
        'differentiate',
        'organize',
        'attribute',
        'deconstruct',
        'integrate',
        'outline',
        'structure',
        'examine',
      ],
      cognitiveProcess: ['differentiating', 'organizing', 'attributing'],
      assessmentTypes: ['analysis-paper', 'case-analysis', 'critique', 'investigation'],
      learningObjectives: [
        'analyze relationships',
        'differentiate components',
        'organize principles',
        'attribute causes',
      ],
    },
    {
      level: 5,
      name: 'Evaluate',
      description: 'Make judgments based on criteria and standards',
      keywords: [
        'evaluate',
        'critique',
        'judge',
        'justify',
        'argue',
        'defend',
        'support',
        'assess',
        'prioritize',
      ],
      cognitiveProcess: ['checking', 'critiquing'],
      assessmentTypes: ['critique', 'debate', 'judgment', 'peer-review'],
      learningObjectives: [
        'evaluate solutions',
        'critique arguments',
        'judge quality',
        'justify decisions',
      ],
    },
    {
      level: 6,
      name: 'Create',
      description: 'Put elements together to form a coherent whole',
      keywords: [
        'create',
        'design',
        'construct',
        'develop',
        'formulate',
        'author',
        'investigate',
        'invent',
        'compose',
      ],
      cognitiveProcess: ['generating', 'planning', 'producing'],
      assessmentTypes: ['project', 'portfolio', 'invention', 'research-paper'],
      learningObjectives: [
        'create solutions',
        'design systems',
        'develop theories',
        'produce original work',
      ],
    },
  ];

  // Knowledge Dimension Indicators
  private readonly knowledgeIndicators = {
    factual: [
      'what',
      'when',
      'where',
      'who',
      'which',
      'terminology',
      'specific details',
      'elements',
    ],
    conceptual: [
      'why',
      'how',
      'relationship',
      'principle',
      'theory',
      'model',
      'structure',
      'category',
    ],
    procedural: [
      'how to',
      'method',
      'technique',
      'algorithm',
      'procedure',
      'process',
      'criteria',
      'when to use',
    ],
    metacognitive: [
      'strategy',
      'cognitive task',
      'self-knowledge',
      'awareness',
      'reflection',
      'monitoring',
      'regulation',
    ],
  };

  // Cognitive complexity weights
  private readonly complexityWeights = {
    questionLength: 0.1,
    conceptCount: 0.2,
    relationshipComplexity: 0.3,
    abstractionLevel: 0.2,
    problemComplexity: 0.2,
  };

  private constructor() {}

  static getInstance(): BloomsTaxonomyValidator {
    if (!BloomsTaxonomyValidator.instance) {
      BloomsTaxonomyValidator.instance = new BloomsTaxonomyValidator();
    }
    return BloomsTaxonomyValidator.instance;
  }

  /**
   * Validate and classify a question according to Bloom's Taxonomy
   */
  validateQuestion(question: Question): TaxonomyValidation {
    const classification = this.classifyQuestion(question);
    const validation = this.performValidation(question, classification);

    return {
      isValid: validation.isValid,
      level: classification.primaryLevel,
      confidence: this.calculateConfidence(question, classification),
      suggestions: this.generateSuggestions(question, classification),
      pedagogicalAlignment: this.calculatePedagogicalAlignment(question, classification),
      cognitiveComplexity: classification.cognitiveLoad,
    };
  }

  /**
   * Classify a question into Bloom's Taxonomy levels
   */
  classifyQuestion(question: Question): QuestionClassification {
    const text = this.getQuestionText(question);
    const levelScores = this.calculateLevelScores(text, question);

    // Find primary level
    const primaryIndex = levelScores.indexOf(Math.max(...levelScores));
    const primaryLevel = this.taxonomyLevels[primaryIndex];

    // Find secondary levels (above threshold)
    const threshold = 0.3;
    const secondaryLevels = this.taxonomyLevels.filter(
      (level, index) => index !== primaryIndex && levelScores[index] > threshold,
    );

    // Determine knowledge dimension
    const knowledgeDimension = this.classifyKnowledgeDimension(text, question);

    // Calculate cognitive load
    const cognitiveLoad = this.calculateCognitiveLoad(question, primaryLevel);

    // Calculate educational value
    const educationalValue = this.calculateEducationalValue(question, classification);

    return {
      primaryLevel,
      secondaryLevels,
      knowledgeDimension,
      cognitiveLoad,
      educationalValue,
    };
  }

  /**
   * Analyze question stem for Bloom's level indicators
   */
  private calculateLevelScores(text: string, question: Question): number[] {
    const scores = new Array(this.taxonomyLevels.length).fill(0);
    const lowerText = text.toLowerCase();

    this.taxonomyLevels.forEach((level, index) => {
      // Check for keyword matches
      let keywordScore = 0;
      level.keywords.forEach((keyword) => {
        if (lowerText.includes(keyword)) {
          keywordScore += 1;
        }
      });

      // Check question type alignment
      const typeScore = this.getQuestionTypeScore(question, level);

      // Check cognitive process alignment
      const processScore = this.getCognitiveProcessScore(text, level);

      // Weighted combination
      scores[index] = keywordScore * 0.4 + typeScore * 0.3 + processScore * 0.3;
    });

    // Normalize scores
    const maxScore = Math.max(...scores);
    return maxScore > 0 ? scores.map((s) => s / maxScore) : scores;
  }

  /**
   * Determine knowledge dimension of the question
   */
  private classifyKnowledgeDimension(text: string, question: Question): KnowledgeDimension {
    const lowerText = text.toLowerCase();
    const scores: Record<KnowledgeDimension, number> = {
      factual: 0,
      conceptual: 0,
      procedural: 0,
      metacognitive: 0,
    };

    // Check for dimension indicators
    Object.entries(this.knowledgeIndicators).forEach(([dimension, indicators]) => {
      indicators.forEach((indicator) => {
        if (lowerText.includes(indicator)) {
          scores[dimension as KnowledgeDimension] += 1;
        }
      });
    });

    // Additional heuristics
    if (question.requiresCalculation) scores.procedural += 2;
    if (question.requiresAnalysis) scores.conceptual += 2;
    if (question.requiresCreativity) scores.metacognitive += 2;

    // Find highest scoring dimension
    let maxDimension: KnowledgeDimension = 'factual';
    let maxScore = 0;

    Object.entries(scores).forEach(([dimension, score]) => {
      if (score > maxScore) {
        maxScore = score;
        maxDimension = dimension as KnowledgeDimension;
      }
    });

    return maxDimension;
  }

  /**
   * Calculate cognitive load of the question
   */
  private calculateCognitiveLoad(question: Question, level: BloomLevel): number {
    let load = 0;

    // Base load from Bloom's level
    load += level.level * 0.15;

    // Question complexity factors
    const text = this.getQuestionText(question);

    // Length complexity
    const words = text.split(' ').length;
    load += Math.min(words / 100, 0.2) * this.complexityWeights.questionLength;

    // Concept count
    const concepts = this.extractConcepts(text);
    load += Math.min(concepts.length / 10, 0.3) * this.complexityWeights.conceptCount;

    // Relationship complexity
    if (text.includes('relationship') || text.includes('compare') || text.includes('contrast')) {
      load += 0.2 * this.complexityWeights.relationshipComplexity;
    }

    // Abstraction level
    if (question.requiresAbstraction || level.level >= 4) {
      load += 0.3 * this.complexityWeights.abstractionLevel;
    }

    // Problem complexity
    if (question.options && question.options.length > 4) {
      load += 0.1 * this.complexityWeights.problemComplexity;
    }

    return Math.min(load, 1.0); // Normalize to 0-1
  }

  /**
   * Calculate educational value of the question
   */
  private calculateEducationalValue(question: Question, classification: any): number {
    let value = 0;

    // Higher Bloom's levels have more educational value
    value += classification.primaryLevel.level * 0.1;

    // Knowledge dimension value
    const dimensionValues = {
      factual: 0.2,
      conceptual: 0.3,
      procedural: 0.35,
      metacognitive: 0.4,
    };
    value += dimensionValues[classification.knowledgeDimension];

    // Clear learning objectives
    if (question.learningObjective) {
      value += 0.2;
    }

    // Provides feedback/explanation
    if (question.explanation) {
      value += 0.15;
    }

    // Real-world application
    if (this.hasRealWorldContext(question)) {
      value += 0.15;
    }

    return Math.min(value, 1.0);
  }

  /**
   * Validate question against pedagogical standards
   */
  private performValidation(
    question: Question,
    classification: QuestionClassification,
  ): { isValid: boolean } {
    const validationCriteria = [
      this.hasLearningObjective(question),
      this.hasAppropriateComplexity(question, classification),
      this.hasValidAssessment(question, classification),
      this.hasClearInstructions(question),
      this.hasEducationalValue(classification),
    ];

    const passedCriteria = validationCriteria.filter((c) => c).length;
    const isValid = passedCriteria >= 3; // At least 3 out of 5 criteria

    return { isValid };
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(
    question: Question,
    classification: QuestionClassification,
  ): string[] {
    const suggestions: string[] = [];

    // Check for missing learning objective
    if (!question.learningObjective) {
      suggestions.push(
        `Add a clear learning objective aligned with ${classification.primaryLevel.name} level`,
      );
    }

    // Check cognitive load
    if (classification.cognitiveLoad > 0.8) {
      suggestions.push('Consider breaking down the question to reduce cognitive load');
    }

    // Check for explanation
    if (!question.explanation) {
      suggestions.push('Add an explanation to enhance learning value');
    }

    // Check question clarity
    const text = this.getQuestionText(question);
    if (text.length > 200) {
      suggestions.push('Consider simplifying the question stem for clarity');
    }

    // Level-specific suggestions
    if (classification.primaryLevel.level <= 2 && !question.options) {
      suggestions.push('Consider adding multiple choice options for lower-level assessment');
    }

    if (classification.primaryLevel.level >= 4 && question.type === 'multiple-choice') {
      suggestions.push('Consider using open-ended format for higher-order thinking assessment');
    }

    // Knowledge dimension alignment
    if (classification.knowledgeDimension === 'metacognitive' && !text.includes('strategy')) {
      suggestions.push('Include strategic thinking elements for metacognitive assessment');
    }

    return suggestions;
  }

  /**
   * Calculate confidence in classification
   */
  private calculateConfidence(question: Question, classification: QuestionClassification): number {
    let confidence = 0.5; // Base confidence

    // Clear keyword matches increase confidence
    const text = this.getQuestionText(question).toLowerCase();
    const keywordMatches = classification.primaryLevel.keywords.filter((k) =>
      text.includes(k),
    ).length;
    confidence += keywordMatches * 0.05;

    // Question type alignment
    if (classification.primaryLevel.assessmentTypes.includes(question.type)) {
      confidence += 0.15;
    }

    // Clear learning objective
    if (question.learningObjective) {
      confidence += 0.1;
    }

    // Low ambiguity (few secondary levels)
    if (classification.secondaryLevels.length <= 1) {
      confidence += 0.1;
    }

    return Math.min(confidence, 0.95);
  }

  /**
   * Calculate pedagogical alignment score
   */
  private calculatePedagogicalAlignment(
    question: Question,
    classification: QuestionClassification,
  ): number {
    let alignment = 0;

    // Learning objective alignment
    if (question.learningObjective) {
      const objectiveAligned = classification.primaryLevel.learningObjectives.some((obj) =>
        question.learningObjective?.toLowerCase().includes(obj.split(' ')[0]),
      );
      if (objectiveAligned) alignment += 0.3;
    }

    // Assessment type alignment
    if (classification.primaryLevel.assessmentTypes.includes(question.type)) {
      alignment += 0.25;
    }

    // Cognitive process alignment
    const processAligned = this.checkCognitiveProcessAlignment(
      question,
      classification.primaryLevel,
    );
    if (processAligned) alignment += 0.25;

    // Appropriate difficulty
    const difficultyAligned = this.checkDifficultyAlignment(question, classification.primaryLevel);
    if (difficultyAligned) alignment += 0.2;

    return alignment;
  }

  /**
   * Batch validate multiple questions
   */
  validateQuestionSet(questions: Question[]): {
    validations: TaxonomyValidation[];
    summary: TaxonomySummary;
  } {
    const validations = questions.map((q) => this.validateQuestion(q));

    const summary = this.generateSummary(validations, questions);

    return { validations, summary };
  }

  /**
   * Generate summary statistics for question set
   */
  private generateSummary(
    validations: TaxonomyValidation[],
    questions: Question[],
  ): TaxonomySummary {
    const levelDistribution = new Array(6).fill(0);
    validations.forEach((v) => {
      levelDistribution[v.level.level - 1]++;
    });

    const avgComplexity =
      validations.reduce((sum, v) => sum + v.cognitiveComplexity, 0) / validations.length;
    const avgAlignment =
      validations.reduce((sum, v) => sum + v.pedagogicalAlignment, 0) / validations.length;
    const validCount = validations.filter((v) => v.isValid).length;

    return {
      totalQuestions: questions.length,
      validQuestions: validCount,
      invalidQuestions: questions.length - validCount,
      levelDistribution,
      averageComplexity: avgComplexity,
      averageAlignment: avgAlignment,
      recommendations: this.generateSetRecommendations(levelDistribution, avgComplexity),
    };
  }

  /**
   * Generate recommendations for question set
   */
  private generateSetRecommendations(distribution: number[], avgComplexity: number): string[] {
    const recommendations: string[] = [];
    const total = distribution.reduce((a, b) => a + b, 0);

    // Check distribution balance
    const lowerLevels = (distribution[0] + distribution[1]) / total;
    const higherLevels = (distribution[3] + distribution[4] + distribution[5]) / total;

    if (lowerLevels > 0.6) {
      recommendations.push(
        'Consider adding more higher-order thinking questions (Analyze, Evaluate, Create)',
      );
    }

    if (higherLevels > 0.7) {
      recommendations.push(
        'Consider adding foundational questions (Remember, Understand) for scaffolding',
      );
    }

    // Check complexity
    if (avgComplexity > 0.7) {
      recommendations.push('Overall cognitive load is high - consider simplifying some questions');
    }

    if (avgComplexity < 0.3) {
      recommendations.push(
        'Questions may be too simple - consider increasing complexity for better learning outcomes',
      );
    }

    // Check for missing levels
    distribution.forEach((count, index) => {
      if (count === 0) {
        recommendations.push(
          `No questions at ${this.taxonomyLevels[index].name} level - consider adding for comprehensive assessment`,
        );
      }
    });

    return recommendations;
  }

  /**
   * Helper methods
   */
  private getQuestionText(question: Question): string {
    return question.text || question.questionText || '';
  }

  private getQuestionTypeScore(question: Question, level: BloomLevel): number {
    if (level.assessmentTypes.includes(question.type)) {
      return 1.0;
    }
    // Partial credit for related types
    if (question.type === 'open-ended' && level.level >= 4) {
      return 0.7;
    }
    if (question.type === 'multiple-choice' && level.level <= 3) {
      return 0.7;
    }
    return 0.2;
  }

  private getCognitiveProcessScore(text: string, level: BloomLevel): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    level.cognitiveProcess.forEach((process) => {
      if (lowerText.includes(process) || lowerText.includes(process.slice(0, -3))) {
        score += 1;
      }
    });
    return Math.min(score / level.cognitiveProcess.length, 1.0);
  }

  private extractConcepts(text: string): string[] {
    // Simple concept extraction - can be enhanced with NLP
    const words = text.split(' ');
    const concepts: string[] = [];
    const conceptIndicators = ['concept', 'principle', 'theory', 'law', 'rule', 'definition'];

    words.forEach((word, index) => {
      if (conceptIndicators.includes(word.toLowerCase())) {
        if (index > 0) concepts.push(words[index - 1]);
        if (index < words.length - 1) concepts.push(words[index + 1]);
      }
    });

    return concepts;
  }

  private hasLearningObjective(question: Question): boolean {
    return !!question.learningObjective && question.learningObjective.length > 10;
  }

  private hasAppropriateComplexity(
    question: Question,
    classification: QuestionClassification,
  ): boolean {
    const levelComplexity = classification.primaryLevel.level * 0.15;
    return Math.abs(classification.cognitiveLoad - levelComplexity) < 0.3;
  }

  private hasValidAssessment(question: Question, classification: QuestionClassification): boolean {
    return (
      classification.primaryLevel.assessmentTypes.includes(question.type) ||
      (question.type === 'adaptive' && classification.cognitiveLoad > 0.5)
    );
  }

  private hasClearInstructions(question: Question): boolean {
    const text = this.getQuestionText(question);
    return (text.length > 10 && text.includes('?')) || text.includes('.');
  }

  private hasEducationalValue(classification: QuestionClassification): boolean {
    return classification.educationalValue > 0.5;
  }

  private hasRealWorldContext(question: Question): boolean {
    const contextIndicators = [
      'real',
      'world',
      'practical',
      'application',
      'scenario',
      'case',
      'example',
    ];
    const text = this.getQuestionText(question).toLowerCase();
    return contextIndicators.some((indicator) => text.includes(indicator));
  }

  private checkCognitiveProcessAlignment(question: Question, level: BloomLevel): boolean {
    const text = this.getQuestionText(question).toLowerCase();
    return level.cognitiveProcess.some(
      (process) => text.includes(process) || text.includes(process.slice(0, -3)),
    );
  }

  private checkDifficultyAlignment(question: Question, level: BloomLevel): boolean {
    const expectedDifficulty = level.level * 0.8; // Scale to 0-5
    return Math.abs(question.difficulty - expectedDifficulty) < 1.5;
  }
}

// Type definitions for summary
interface TaxonomySummary {
  totalQuestions: number;
  validQuestions: number;
  invalidQuestions: number;
  levelDistribution: number[];
  averageComplexity: number;
  averageAlignment: number;
  recommendations: string[];
}

// Export singleton instance
export default BloomsTaxonomyValidator.getInstance();
