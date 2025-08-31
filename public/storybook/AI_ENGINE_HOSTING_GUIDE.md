# AI Engine Hosting Guide for QuizMentor

## 🎯 Overview

You have 3 main approaches for hosting AI capabilities:

1. **API-Based** (OpenAI, Anthropic, Google) - Easiest, no hosting needed
2. **Serverless** (Replicate, Modal, Banana) - Good for open-source models
3. **Self-Hosted** (RunPod, Vast.ai, own GPU) - Most control, best for scale

## 📊 Quick Decision Matrix

| Solution         | Cost                    | Setup Time | Best For                  |
| ---------------- | ----------------------- | ---------- | ------------------------- |
| OpenAI API       | $0.002-0.02/1K tokens   | 5 min      | Quick start, high quality |
| Anthropic Claude | $0.008-0.024/1K tokens  | 5 min      | Complex reasoning         |
| Google Gemini    | $0.0005-0.002/1K tokens | 10 min     | Cost-effective            |
| Replicate        | $0.0002-0.02/sec        | 15 min     | Open-source models        |
| Modal            | $0.0001/sec GPU         | 30 min     | Custom Python code        |
| RunPod           | $0.2-2/hour             | 1 hour     | Dedicated GPUs            |
| Self-hosted      | $500-5000/month         | Days       | Full control              |

---

## 1️⃣ Option 1: API-Based (Recommended to Start)

### OpenAI Integration

```typescript
// lib/ai/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function validateQuestion(question: any) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: `You are an educational expert. Analyze this question and return:
        1. Bloom's Taxonomy level (1-6)
        2. Cognitive complexity (0-1)
        3. Quality score (0-1)
        4. Suggestions for improvement
        Return as JSON.`,
      },
      {
        role: 'user',
        content: JSON.stringify(question),
      },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content!);
}

export async function generateAdaptiveQuestions(
  topic: string,
  difficulty: number,
  count: number = 5,
) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: `Generate ${count} quiz questions about ${topic} at difficulty level ${difficulty}/5.
        Include multiple choice and short answer questions.
        Return as JSON array with: text, type, options, correctAnswer, explanation.`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

### Anthropic Claude Integration

```typescript
// lib/ai/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function analyzeLearningSession(sessionData: any) {
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `Analyze this learning session and provide:
      1. Performance insights
      2. Knowledge gaps identified
      3. Recommended next topics
      4. Personalized study plan
      
      Session data: ${JSON.stringify(sessionData)}`,
      },
    ],
  });

  return response.content[0].text;
}
```

### Cost Optimization with Caching

```typescript
// app/api/ai/validate/route.ts
import { NextResponse } from 'next/server';
import { validateQuestion } from '@/lib/ai/openai';
import { redis } from '@/lib/redis'; // If using Upstash

export async function POST(req: Request) {
  const question = await req.json();

  // Create cache key from question
  const cacheKey = `ai:validate:${Buffer.from(JSON.stringify(question)).toString('base64').slice(0, 20)}`;

  // Check cache first
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true });
    }
  }

  // Call AI API
  const result = await validateQuestion(question);

  // Cache for 24 hours
  if (redis) {
    await redis.set(cacheKey, result, { ex: 86400 });
  }

  return NextResponse.json(result);
}
```

---

## 2️⃣ Option 2: Serverless Model Hosting

### Replicate (Easy Open-Source Models)

```typescript
// lib/ai/replicate.ts
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Use Llama 2 for question generation
export async function generateWithLlama(prompt: string) {
  const output = await replicate.run(
    'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3',
    {
      input: {
        prompt,
        max_new_tokens: 500,
        temperature: 0.7,
      },
    },
  );

  return output;
}

// Use BERT for question classification
export async function classifyWithBERT(text: string) {
  const output = await replicate.run('daanelson/bert-base-uncased:latest', {
    input: { text },
  });

  return output;
}
```

### Modal (Python-Based, More Flexible)

```python
# modal_app.py - Deploy Python AI code
import modal

stub = modal.Stub("quizmentor-ai")

# Define the container image
image = modal.Image.debian_slim().pip_install(
    "transformers",
    "torch",
    "sentence-transformers",
    "scikit-learn"
)

@stub.function(image=image, gpu="T4")
def analyze_learning_pattern(user_responses):
    from transformers import pipeline

    # Load model
    classifier = pipeline("text-classification",
                         model="bert-base-uncased")

    # Analyze patterns
    results = []
    for response in user_responses:
        analysis = classifier(response['text'])
        results.append({
            'question_id': response['id'],
            'difficulty_match': calculate_difficulty(analysis),
            'cognitive_level': determine_bloom_level(analysis)
        })

    return results

@stub.function(image=image, gpu="T4", keep_warm=1)
def generate_adaptive_question(topic, difficulty, previous_responses):
    # Your ML logic here
    pass
```

Call from Next.js:

```typescript
// lib/ai/modal.ts
export async function callModalFunction(functionName: string, args: any) {
  const response = await fetch(`https://your-modal-app.modal.run/${functionName}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MODAL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });

  return response.json();
}
```

---

## 3️⃣ Option 3: Self-Hosted Models

### RunPod (GPU Cloud)

```yaml
# runpod-deployment.yaml
apiVersion: v1
kind: Pod
metadata:
  name: quizmentor-ai
spec:
  containers:
    - name: ai-server
      image: runpod/pytorch:2.0.1-py3.10-cuda11.8.0-devel
      ports:
        - containerPort: 8000
      resources:
        limits:
          nvidia.com/gpu: 1 # Request 1 GPU
      env:
        - name: MODEL_NAME
          value: 'meta-llama/Llama-2-13b-chat-hf'
```

```python
# ai_server.py - Run on RunPod
from fastapi import FastAPI
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

app = FastAPI()

# Load model once
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-chat-hf",
    torch_dtype=torch.float16,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-13b-chat-hf")

@app.post("/generate")
async def generate(prompt: str, max_tokens: int = 200):
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=max_tokens)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"response": response}

@app.post("/validate-question")
async def validate(question: dict):
    # Your validation logic
    pass
```

### Ollama (Local Development)

```bash
# Install Ollama locally
curl -fsSL https://ollama.ai/install.sh | sh

# Pull models
ollama pull llama2
ollama pull mistral
ollama pull phi
```

```typescript
// lib/ai/ollama.ts - For local development
export async function callOllama(prompt: string) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama2',
      prompt,
      stream: false,
    }),
  });

  const data = await response.json();
  return data.response;
}
```

---

## 4️⃣ Hybrid Approach (Recommended)

Combine multiple services for optimal cost/performance:

```typescript
// lib/ai/hybrid.ts
import { validateQuestion as validateOpenAI } from './openai';
import { generateWithLlama } from './replicate';
import { callOllama } from './ollama';

export class AIService {
  // Use OpenAI for complex reasoning
  async validateQuestion(question: any) {
    if (process.env.NODE_ENV === 'development') {
      // Use local Ollama for development
      return this.validateWithOllama(question);
    }
    // Use OpenAI in production
    return validateOpenAI(question);
  }

  // Use Replicate for bulk generation (cheaper)
  async generateQuestions(topic: string, count: number) {
    const prompt = `Generate ${count} quiz questions about ${topic}...`;
    return generateWithLlama(prompt);
  }

  // Use cached embeddings for similarity search
  async findSimilarQuestions(question: string) {
    // Use vector DB (Supabase pgvector or Pinecone)
    const embedding = await this.getEmbedding(question);
    return this.searchVectorDB(embedding);
  }

  private async getEmbedding(text: string) {
    // Use OpenAI embeddings API (cheap and good)
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }
}
```

---

## 5️⃣ Edge Functions (Vercel AI SDK)

```typescript
// app/api/ai/stream/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { openai } from '@/lib/ai/openai';

export const runtime = 'edge'; // Run on edge for lower latency

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

---

## 💰 Cost Optimization Strategies

### 1. Smart Model Selection

```typescript
function selectModel(task: string, complexity: number) {
  if (task === 'simple_classification') {
    return 'gpt-3.5-turbo'; // Cheap and fast
  }
  if (task === 'complex_reasoning' && complexity > 0.8) {
    return 'gpt-4-turbo'; // High quality when needed
  }
  if (task === 'bulk_generation') {
    return 'llama-2-13b'; // Open source via Replicate
  }
  return 'gpt-3.5-turbo'; // Default
}
```

### 2. Implement Caching Layers

```typescript
// Cache at multiple levels
const cache = {
  memory: new Map(), // In-memory cache
  redis: redis, // Redis cache
  database: supabase, // Long-term cache
};

async function getCachedOrGenerate(key: string, generator: Function) {
  // Check memory first (fastest)
  if (cache.memory.has(key)) {
    return cache.memory.get(key);
  }

  // Check Redis (fast)
  if (cache.redis) {
    const cached = await cache.redis.get(key);
    if (cached) {
      cache.memory.set(key, cached);
      return cached;
    }
  }

  // Generate new
  const result = await generator();

  // Cache everywhere
  cache.memory.set(key, result);
  if (cache.redis) {
    await cache.redis.set(key, result, { ex: 3600 });
  }

  return result;
}
```

### 3. Batch Processing

```typescript
// Process multiple items in one API call
async function batchValidate(questions: any[]) {
  const prompt = `Validate these ${questions.length} questions...
  ${JSON.stringify(questions)}
  Return a JSON array with validation for each.`;

  // One API call instead of N
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Next.js Frontend                 │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      Next.js API Routes (Edge)          │
│         (Validation Layer)               │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌─────────────┐ ┌─────────┐ ┌─────────────┐
│  OpenAI API │ │Replicate │ │   RunPod    │
│  (Primary)  │ │(Fallback)│ │  (Custom)   │
└─────────────┘ └─────────┘ └─────────────┘
                    │
                    ▼
        ┌─────────────────────────┐
        │    Caching Layer        │
        │  (Redis/Upstash)        │
        └─────────────────────────┘
```

---

## 📈 Scaling Path

### Phase 1: Start Simple (0-1000 users)

- Use OpenAI API directly
- Basic Redis caching
- Cost: ~$50-200/month

### Phase 2: Optimize (1000-10K users)

- Add Replicate for bulk operations
- Implement smart caching
- Use embeddings for similarity
- Cost: ~$200-1000/month

### Phase 3: Scale (10K+ users)

- Deploy own models on RunPod
- Use vector databases
- Implement model routing
- Cost: ~$1000-5000/month

---

## 🔧 Environment Variables

```env
# .env.local

# Option 1: API-based
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Option 2: Serverless
REPLICATE_API_TOKEN=r8_...
MODAL_TOKEN_ID=...
MODAL_TOKEN_SECRET=...

# Option 3: Self-hosted
RUNPOD_API_KEY=...
RUNPOD_ENDPOINT=https://...

# Caching
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Vector DB (for embeddings)
PINECONE_API_KEY=...
PINECONE_INDEX=...
```

---

## ✅ Recommended Starting Setup

1. **Start with OpenAI API** ($50-200/month)
   - Quick to implement
   - High quality results
   - No infrastructure needed

2. **Add Upstash Redis** (Free tier)
   - Cache AI responses
   - Reduce API costs by 50-80%

3. **Monitor Usage**

   ```typescript
   // Track API usage
   async function trackUsage(model: string, tokens: number) {
     await supabase.from('ai_usage').insert({
       model,
       tokens,
       cost: calculateCost(model, tokens),
       timestamp: new Date(),
     });
   }
   ```

4. **Optimize as You Grow**
   - Switch to cheaper models for simple tasks
   - Implement batching
   - Add fallback options

---

## 🎯 Next Steps

1. Sign up for OpenAI API
2. Implement basic validation endpoint
3. Add caching with Redis
4. Monitor costs and usage
5. Optimize based on actual patterns

Need help with any specific implementation?
