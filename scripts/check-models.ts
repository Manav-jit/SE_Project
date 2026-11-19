import fs from 'fs';
const key = fs.readFileSync('.env.local', 'utf8').split('=')[1].trim();
fetch('https://api.groq.com/openai/v1/models', { headers: { 'Authorization': `Bearer ${key}` } })
  .then(r => r.json())
  .then(data => console.log((data.data as Array<{ id: string }>).map(m => m.id)))
  .catch(console.error);
