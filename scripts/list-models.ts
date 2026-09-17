import fs from 'fs';

async function listModels() {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/GROQ_API_KEY=(.+)/);
  if (!match) return console.log('No key found');
  const key = match[1].trim();
  
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${key}` }
  });
  
  const data = await res.json();
  if (data.data) {
    console.log("AVAILABLE MODELS:", data.data.map((m: any) => m.id).join(', '));
  } else {
    console.log("ERROR:", data);
  }
}

listModels();
