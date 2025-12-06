import { invokeLLM } from "./server/_core/llm";

interface TestResult {
  testName: string;
  status: "PASS" | "FAIL" | "ERROR";
  duration: number;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(
  testName: string,
  testFn: () => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    results.push({ testName, status: "PASS", duration });
    console.log(`✓ ${testName} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    results.push({
      testName,
      status: "ERROR",
      duration,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`✗ ${testName} (${duration}ms)`);
    console.log(`  Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function testBasicTextGeneration() {
  const result = await invokeLLM({
    messages: [
      {
        role: "user",
        content: "Say 'Hello World' and nothing else.",
      },
    ],
  });

  if (!result.choices[0]?.message?.content) {
    throw new Error("No content returned");
  }

  const content =
    typeof result.choices[0].message.content === "string"
      ? result.choices[0].message.content
      : JSON.stringify(result.choices[0].message.content);

  if (!content.toLowerCase().includes("hello")) {
    throw new Error(`Unexpected response: ${content}`);
  }
}

async function testMultiTurnConversation() {
  const result = await invokeLLM({
    messages: [
      {
        role: "user",
        content: "My name is Alice.",
      },
      {
        role: "assistant",
        content: "Hello Alice! Nice to meet you.",
      },
      {
        role: "user",
        content: "What is my name?",
      },
    ],
  });

  const content =
    typeof result.choices[0].message.content === "string"
      ? result.choices[0].message.content
      : JSON.stringify(result.choices[0].message.content);

  if (!content.toLowerCase().includes("alice")) {
    throw new Error(`Failed to remember name: ${content}`);
  }
}

async function testSystemPrompt() {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a pirate. Always respond in pirate speak.",
      },
      {
        role: "user",
        content: "Tell me about the weather.",
      },
    ],
  });

  const content =
    typeof result.choices[0].message.content === "string"
      ? result.choices[0].message.content
      : JSON.stringify(result.choices[0].message.content);

  // Check for pirate-like language patterns
  const piratePatterns = ["arr", "matey", "ahoy", "ye", "aye", "sea", "ship"];
  const hasPirateSpeak = piratePatterns.some((pattern) =>
    content.toLowerCase().includes(pattern)
  );

  if (!hasPirateSpeak) {
    throw new Error(`Response doesn't follow system prompt: ${content}`);
  }
}

async function testLongFormContent() {
  const result = await invokeLLM({
    messages: [
      {
        role: "user",
        content:
          "Write a detailed 3-paragraph essay about the benefits of AI in business automation.",
      },
    ],
  });

  const content =
    typeof result.choices[0].message.content === "string"
      ? result.choices[0].message.content
      : JSON.stringify(result.choices[0].message.content);

  if (content.length < 500) {
    throw new Error(`Content too short: ${content.length} characters`);
  }

  // Check for business/AI related terms
  const keywords = ["ai", "business", "automation", "efficiency"];
  const hasKeywords = keywords.some((keyword) =>
    content.toLowerCase().includes(keyword)
  );

  if (!hasKeywords) {
    throw new Error("Content doesn't match the requested topic");
  }
}

async function testSalesCopyGeneration() {
  const result = await invokeLLM({
    messages: [
      {
        role: "user",
        content:
          "Generate a compelling product headline for an AI-powered restaurant management system. Make it catchy and benefit-focused.",
      },
    ],
  });

  const content =
    typeof result.choices[0].message.content === "string"
      ? result.choices[0].message.content
      : JSON.stringify(result.choices[0].message.content);

  if (content.length < 20 || content.length > 200) {
    throw new Error(`Headline length inappropriate: ${content.length} characters`);
  }
}

async function testEmailGeneration() {
  const result = await invokeLLM({
    messages: [
      {
        role: "user",
        content:
          "Write a professional sales email introducing an AI automation platform to small business owners. Keep it concise and persuasive.",
      },
    ],
  });

  const content =
    typeof result.choices[0].message.content === "string"
      ? result.choices[0].message.content
      : JSON.stringify(result.choices[0].message.content);

  if (content.length < 200) {
    throw new Error(`Email too short: ${content.length} characters`);
  }

  // Check for email-like structure
  const hasGreeting = /dear|hello|hi|greetings/i.test(content);
  const hasClosing = /sincerely|regards|best|thank you/i.test(content);

  if (!hasGreeting || !hasClosing) {
    throw new Error("Email doesn't have proper structure");
  }
}

async function testDataAnalysis() {
  const result = await invokeLLM({
    messages: [
      {
        role: "user",
        content:
          "Analyze this sales data and provide insights: Q1: $50,000, Q2: $65,000, Q3: $72,000, Q4: $80,000. What trends do you see?",
      },
    ],
  });

  const content =
    typeof result.choices[0].message.content === "string"
      ? result.choices[0].message.content
      : JSON.stringify(result.choices[0].message.content);

  // Check for analytical terms
  const analyticalTerms = [
    "growth",
    "increase",
    "trend",
    "pattern",
    "analysis",
    "percent",
  ];
  const hasAnalysis = analyticalTerms.some((term) =>
    content.toLowerCase().includes(term)
  );

  if (!hasAnalysis) {
    throw new Error("Response doesn't contain analytical insights");
  }
}

async function testResponseTime() {
  const startTime = Date.now();
  await invokeLLM({
    messages: [
      {
        role: "user",
        content: "Count from 1 to 5.",
      },
    ],
  });
  const duration = Date.now() - startTime;

  if (duration > 10000) {
    throw new Error(`Response too slow: ${duration}ms`);
  }
}

async function testTokenUsage() {
  const result = await invokeLLM({
    messages: [
      {
        role: "user",
        content: "Say hello.",
      },
    ],
  });

  if (!result.usage) {
    throw new Error("No usage information returned");
  }

  if (
    !result.usage.prompt_tokens ||
    !result.usage.completion_tokens ||
    !result.usage.total_tokens
  ) {
    throw new Error("Incomplete usage information");
  }

  if (result.usage.total_tokens !== result.usage.prompt_tokens + result.usage.completion_tokens) {
    throw new Error("Token count mismatch");
  }
}

async function testModelInfo() {
  const result = await invokeLLM({
    messages: [
      {
        role: "user",
        content: "Hi",
      },
    ],
  });

  if (!result.model) {
    throw new Error("No model information returned");
  }

  if (!result.id || !result.created) {
    throw new Error("Missing response metadata");
  }
}

async function main() {
  console.log("=== AI Performance Test Suite ===\n");
  console.log("Testing AI capabilities and performance...\n");

  await runTest("Basic Text Generation", testBasicTextGeneration);
  await runTest("Multi-turn Conversation", testMultiTurnConversation);
  await runTest("System Prompt Following", testSystemPrompt);
  await runTest("Long-form Content Generation", testLongFormContent);
  await runTest("Sales Copy Generation", testSalesCopyGeneration);
  await runTest("Email Generation", testEmailGeneration);
  await runTest("Data Analysis", testDataAnalysis);
  await runTest("Response Time", testResponseTime);
  await runTest("Token Usage Tracking", testTokenUsage);
  await runTest("Model Information", testModelInfo);

  console.log("\n=== Test Summary ===");
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const errors = results.filter((r) => r.status === "ERROR").length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Errors: ${errors}`);

  const avgDuration =
    results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);

  if (errors > 0) {
    console.log("\n=== Failed Tests ===");
    results
      .filter((r) => r.status === "ERROR")
      .forEach((r) => {
        console.log(`\n${r.testName}:`);
        console.log(`  ${r.error}`);
      });
  }

  process.exit(errors > 0 ? 1 : 0);
}

main();
