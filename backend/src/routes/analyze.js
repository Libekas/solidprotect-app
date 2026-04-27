const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const router = express.Router();

const SPFR100_FACTS = `
SPFR100 Technical Facts (use these exact values):
- Consumption: 220–250 ml/m² (NOT 210 ml/m²)
- Specific gravity: 1.15 g/ml (so approx 240 g/m²)
- Application: two-coat system
- Classification: EN 13501-1 B-s1,d0 (RISE TG-0086-99)
- Suitable for: spruce at ≥18mm thickness confirmed
- Compatible with: CLT, glulam, solid timber, plywood
- Properties: transparent, water-based, non-corrosive, pH-neutral, VOC-free, formaldehyde-free
- Canada note: EN 13501-1 is a European standard. For Canadian projects, CAN/ULC-S102 may be required for code compliance. Do not imply EN classification alone covers Canadian code.
- Tinted SPFR100 is only sold bundled with fire retardant treatment service
- Company: Solid Protect OÜ, Estonia. Contact: Taavi Küng, Business Development Manager, +372 5686 4224, solidprotect.eu
`;

router.post('/email', auth, async (req, res) => {
  const { lead, emailDraft, emailType } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY puudub' });
  }

  const leadContext = `
Lead profile:
- Name: ${lead.first_name} ${lead.last_name}
- Role: ${lead.role || 'unknown'}
- Company: ${lead.company_name || 'unknown'}
- Company description: ${lead.company_description || 'none'}
- Country/Market: ${lead.country || lead.market || 'unknown'}
- Campaign: ${lead.campaign_name || 'unknown'}
- Email sequence step: ${lead.steps_done || 0} of ${lead.steps_total || 2}
`;

  const prompt = `You are an expert B2B sales email analyst for Solid Protect OÜ, a company selling SPFR100 fire retardant treatment for wood.

${SPFR100_FACTS}

${leadContext}

Current email draft (${emailType || 'initial'}):
---
${emailDraft}
---

Your task:
1. Briefly analyze if this email is well-targeted for this specific lead (2-3 sentences max)
2. Identify any technical errors (especially wrong consumption values, misleading certification claims for non-EU markets)
3. Write an improved version of the email that is better personalized for this lead

Return your response in this exact JSON format:
{
  "analysis": "Brief assessment of the current email for this lead",
  "issues": ["issue 1", "issue 2"],
  "improved_email": "Full improved email text here"
}

Rules for improved email:
- Keep subject line format: "Subject: ..."
- Use correct consumption: 220–250 ml/m²
- For Canadian leads, mention EN 13501-1 but don't imply it covers Canadian code compliance
- Personalize based on the company description and role
- Keep it professional and concise
- Sign off as: Taavi Küng / Business Development Manager / Solid Protect / +372 5686 4224`;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (err) {
    console.error('OpenAI error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
});

module.exports = router;
