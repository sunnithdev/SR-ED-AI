import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/*
* Classify commits for SR&ED eligibility
*/
router.post("/classify-commits", requireAuth, async (req, res) => {
  try {
    const { commits } = req.body;

    if (!commits || !Array.isArray(commits)) {
      return res.status(400).json({ error: "Commits array required" });
    }

    //Prompt
    const prompt = `
You are an SR&ED (Scientific Research & Experimental Development) auditor assistant.

Your job: analyze Git commit messages and determine if each one relates to SR&ED work.

SR&ED work includes:
- Resolving technological uncertainty
- Experiments to solve unknown problems
- Iterative testing / trial and error
- Algorithmic improvements
- Debugging unpredictable behavior
- Fixing complex systemic issues
- Research-oriented development

NOT SR&ED:
- Routine coding
- UI changes
- Formatting
- Minor refactors
- Documentation
- Chore tasks

Return STRICT JSON. 
For each commit, output:

{
  "sha": "...",
  "isSRED": true/false,
  "category": "Experimental Development" | "Technological Uncertainty" | "Routine Work" | null,
  "confidence": 0.0–1.0,
  "reason": "short explanation"
}

Commits:
${JSON.stringify(commits, null, 2)}
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-5-nano",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an SR&ED audit expert." },
        { role: "user", content: prompt }
      ]
    });

    const json = JSON.parse(aiResponse.choices[0].message.content!);

    return res.json(json);

  } catch (err) {
    console.error("AI commit classification error:", err);
    return res.status(500).json({ error: "AI classification failed" });
  }
});

router.post("/generate-timeline", requireAuth, async (req, res) => {
  try {
    const { commits, projectName, repo } = req.body;

    if (!commits || !Array.isArray(commits) || commits.length === 0) {
      return res.status(400).json({ error: "Non-empty commits array required" });
    }

    // In your frontend you'll already filter to "selected" SR&ED commits.
    // Here we just assume what we get are the ones user kept.
    const sortedCommits = [...commits].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const prompt = `
You are an SR&ED (Scientific Research & Experimental Development) technical writer.

Your job is to create a CRA-ready SR&ED timeline report using ONLY the provided commit evidence.
Keep the writing concise, factual, technical, and audit-friendly.

Output MUST be MARKDOWN and include the following sections:

---

## 1. Project Overview (3–5 sentences)
Summarize:
- the technical goal of the system
- what problem it solves
- why the work involves technological uncertainty

---

## 2. Technological Uncertainties
List real technology uncertainties inferred from the commits.
Examples: scaling limits, unpredictable API behaviour, integration instability, performance issues, architectural constraints.
Exclude anything UI or trivial.

---

## 3. Systematic Investigation (Chronological SR&ED Timeline)
Create a *proper SR&ED timeline* grouped by phases.

For each phase include:
- date range (from commits)
- what was attempted
- experiments & iterations
- debugging attempts
- architectural changes
- failures or unexpected results
- why the work was uncertain
- reference commits as (commit abc123)

Do NOT list commits individually — group into phases.

---

## 4. Obstacles & Resolutions
Describe:
- unexpected behaviours
- instability
- API integration issues
- performance regressions
- logical/algorithmic issues
Explain why these were non-routine.

---

## 5. Technological Advancements
Summarize the knowledge gained and improvements achieved.

---

## 6. Estimated SR&ED Effort & Cost Basis
Provide effort and eligibility estimates based on commit difficulty.

Include:

### Engineering Effort
- estimated hours (low–medium–high confidence)
- percentage eligible vs non-eligible

### Cost Basis Table (Markdown)

| Activity Phase | Estimated Hours | SR&ED Eligibility % | Notes |
|----------------|-----------------|----------------------|-------|

Use realistic estimates based on commit complexity.

---

## 7. Final Summary
A short (3–4 sentence) justification why this work qualifies for SR&ED.

---

INPUT COMMITS:
${JSON.stringify(sortedCommits, null, 2)}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: "You are an expert SR&ED technical writer. Respond with Markdown only." },
        { role: "user", content: prompt }
      ]
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return res.status(500).json({ error: "Empty response from AI" });
    }

    return res.json({ report: content });
  } catch (err) {
    console.error("AI timeline generation error:", err);
    return res.status(500).json({ error: "AI timeline generation failed" });
  }
});


export default router;
