const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const auth = require('../middleware/auth');
const router = express.Router();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Sa oled Solid Protect OÜ müügi-copilot. Sinu omanik on Taavi Küng.

SOLID PROTECT INFO:
- Toode: SPFR100 — puidule kantav tulekaitseaine
- Sertifikaat: EN 13501-1 klass B-s1,d0 (RISE TG-0086-99)
- Kulunorm: 210 ml/m²
- Sihtturud: Soome, Holland, Kanada
- Sihtkliendid: ehitusfirmad, arhitektid, CLT/massivpuidu töötlejad, tuleohutusspetsialistid

ESIMENE MEIL:
---
Subject: Transparent fire protection for wood applications

Hello [Name],

I'm reaching out to see whether a fire-retardant solution for wood could be relevant to [Company]'s projects.

SPFR100 is a transparent fire-protection treatment for structural and façade wood applications where appearance, low consumption, and exterior durability matter.

Key technical points:
* suitable for interior and exterior wood elements
* transparent and tintable if needed
* European reaction-to-fire classification: EN 13501-1 B-s1,d0
* consumption: 210 mL/m²
* non-corrosive, pH-neutral, VOC-free
* preserves the natural appearance of wood

SPFR100 is particularly relevant for spruce, pine, larch, CLT, plywood, and other softwood-based systems.

We are currently looking for partners in [TURG] in distribution, project collaboration, wood processing, and potential autoclave treatment.

Might this be relevant for any ongoing or upcoming wood projects?

Best regards,
Taavi Küng
Business Development Manager
Solid Protect
+372 5686 4224
---

FOLLOW-UP MEIL:
---
Subject: Re: Transparent fire protection for wood applications

Hello [Name],

Following up to see whether enhanced fire performance for wood is currently relevant for [Company].

SPFR100 is a transparent fire-protection treatment for wood applications where appearance, durability, and low consumption matter.

Might this be relevant for any ongoing or upcoming projects?

Best regards,
Taavi Küng
Business Development Manager
Solid Protect
+372 5686 4224
---

MEILIDE REEGLID:
- Asenda [Name], [Company], [TURG] alati
- Esimene meil — pikk formaat
- Follow-up — lühike formaat
- Ära muuda struktuuri

Suhtled eesti ja inglise keeles. Ole konkreetne ja praktiline.`;

router.post('/chat', auth, async (req, res) => {
  const { messages } = req.body;
  try {
    let msgs = [...messages];
    let finalReply = '';

    while (true) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: msgs
      });

      msgs.push({ role: 'assistant', content: response.content });

      if (response.stop_reason === 'end_turn') {
        finalReply = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
        break;
      }
      if (response.stop_reason === 'tool_use') {
        const toolResults = response.content
          .filter(b => b.type === 'tool_use')
          .map(b => ({ type: 'tool_result', tool_use_id: b.id, content: '' }));
        msgs.push({ role: 'user', content: toolResults });
      } else break;
    }

    res.json({ reply: finalReply, messages: msgs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
