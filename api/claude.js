// Vercel 서버 함수: Claude 호출 (키는 Vercel 환경변수 ANTHROPIC_API_KEY)
export default async function handler(req, res) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (req.method === 'GET') return res.status(200).json({ ok: true, configured: !!key });
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!key) return res.status(503).json({ error: 'ANTHROPIC_API_KEY 미설정' });
  try {
    const { prompt, image, maxTokens } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'prompt 필요' });
    const content = [];
    if (image) content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } });
    content.push({ type: 'text', text: String(prompt).slice(0, 8000) });
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-5-5',
        max_tokens: Math.min(Number(maxTokens) || 2000, 3000),
        messages: [{ role: 'user', content }]
      })
    });
    const j = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: j?.error?.message || 'claude error' });
    return res.status(200).json({ text: (j.content || []).map(c => c.text || '').join('') });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
}
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
