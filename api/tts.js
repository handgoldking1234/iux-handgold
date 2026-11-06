// Vercel 서버 함수: Azure 자연 음성 (환경변수 AZURE_SPEECH_KEY, AZURE_SPEECH_REGION)
const VOICES = ['ko-KR-SoonBokNeural','ko-KR-BongJinNeural','ko-KR-SunHiNeural','ko-KR-InJoonNeural','ko-KR-HyunsuNeural','ko-KR-JiMinNeural'];
const esc = s => String(s).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
export default async function handler(req, res) {
  const key = process.env.AZURE_SPEECH_KEY, region = process.env.AZURE_SPEECH_REGION || 'koreacentral';
  if (req.method === 'GET') return res.status(200).json({ ok: true, configured: !!key });
  if (req.method !== 'POST') return res.status(405).end();
  if (!key) return res.status(503).json({ error: 'AZURE_SPEECH_KEY 미설정' });
  try {
    const { text, voice } = req.body || {};
    const v = VOICES.includes(voice) ? voice : VOICES[0];
    const body = esc(String(text || '').slice(0, 1500))
      .replace(/(\.\.\.|…)/g, '<break time="550ms"/>')
      .replace(/([?!])\s/g, '$1<break time="300ms"/> ');
    const ssml = `<speak version="1.0" xml:lang="ko-KR"><voice name="${v}"><prosody rate="-6%">${body}</prosody></voice></speak>`;
    const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3' },
      body: ssml
    });
    if (!r.ok) return res.status(r.status).json({ error: 'azure ' + r.status });
    res.setHeader('Content-Type', 'audio/mpeg');
    return res.status(200).send(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
}
