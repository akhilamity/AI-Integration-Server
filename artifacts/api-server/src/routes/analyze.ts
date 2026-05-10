import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyzeSessionBody } from "@workspace/api-zod";

const router: IRouter = Router();

function formatTimestamp(ms: number, startMs: number): string {
  const diff = ms - startMs;
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `+${minutes}:${String(seconds).padStart(2, "0")}`;
}

router.post("/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { actions, sessionStart } = parsed.data;

  if (!actions || actions.length === 0) {
    res.status(400).json({ error: "No actions provided" });
    return;
  }

  const start = sessionStart ?? actions[0].timestamp;

  const sessionLog = actions
    .map(
      (a) =>
        `[${formatTimestamp(a.timestamp, start)}] ${a.type}: ${JSON.stringify(a.payload).slice(0, 200)}`
    )
    .join("\n");

  const prompt = `You are a QA engineer reviewing a browser session recording. Analyze the following session log and return a JSON object.

SESSION LOG:
${sessionLog}

Return ONLY valid JSON (no markdown, no code fences) with this exact shape:
{
  "summary": "2-3 sentence overview of what was tested and overall quality",
  "bugs": [
    { "title": "short bug title", "severity": "high|medium|low|info", "detail": "1-2 sentence description" }
  ],
  "testSteps": ["step 1", "step 2"],
  "recommendations": ["rec 1", "rec 2"],
  "coverage": "1-2 sentences on what was covered and what gaps exist"
}

Focus on: console errors, API errors (4xx/5xx), broken flows, slow API calls (>2s), missing validations.`;

  req.log.info({ actionCount: actions.length }, "Analyzing QA session");

  const completion = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = completion.choices[0]?.message?.content ?? "";

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    req.log.error({ content }, "Failed to parse AI response as JSON");
    res.status(500).json({ error: "Could not parse AI response as JSON" });
    return;
  }

  const report = JSON.parse(jsonMatch[0]);
  req.log.info("QA session analysis complete");
  res.json(report);
});

export default router;
