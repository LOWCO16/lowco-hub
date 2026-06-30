export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `You are the Lowco Hub AI assistant for a panel and paint workshop called Low.Co. Your job is to help create job sheets by extracting info from natural conversation.

When the user describes a job, extract and respond with:
1. A friendly confirmation of what you understood
2. A JSON block wrapped in <JOBDATA> tags with this structure:
<JOBDATA>
{
  "customer": "",
  "phone": "",
  "vehicle": "",
  "colour": "",
  "rego": "",
  "sections": {
    "Strip & Refit (R&R)": [],
    "Repairs": [],
    "Paint": [],
    "Detailing": [],
    "Notes": []
  },
  "labour": "",
  "parts": ""
}
</JOBDATA>

Only include sections that have items. Keep it conversational and Australian. If info is missing just leave it blank — don't ask too many questions, just fill what you can and confirm. If no job data is mentioned, just chat normally and help them.`,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error processing request' });
  }
}
