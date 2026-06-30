export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

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
        system: `You are a job sheet assistant for Low.Co panel and paint shop in Australia. Extract job details from natural spoken speech and return ONLY a JSON object with no extra text or markdown. The JSON must have these exact fields:
{
  "customer": "",
  "phone": "",
  "vehicle": "",
  "colour": "",
  "rego": "",
  "stripRefit": [],
  "repairs": [],
  "paint": [],
  "detailing": [],
  "notes": []
}
Rules:
- customer: the owner/customer name only
- vehicle: make and model only (no colour)
- colour: colour of the car
- stripRefit: items for strip and refit / remove and refit / R&R section
- repairs: panel repair items
- paint: painting items
- detailing: detailing items
- notes: any notes, special instructions, who needs to do what
- If someone says "no repairs" leave repairs as empty array
- Split items sensibly, one task per array item
- Ignore filler words, interruptions, "um", "uh" etc
- Return ONLY the JSON, nothing else`,
        messages: [{ role: 'user', content: text }],
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
