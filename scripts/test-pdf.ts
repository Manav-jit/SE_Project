import { generateFilledForm } from '../src/lib/pdf/generator';
import fs from 'fs';

async function main() {
  const bytes = await generateFilledForm({
    name: 'Ramesh Kumar',
    age: 45,
    gender: 'male',
    occupation: 'farmer',
    state: 'Punjab',
    income: 180000,
    verified: true
  }, 'pm_kisan');
  console.log('SUCCESS: Generated PDF bytes length =', bytes.length);
  fs.writeFileSync('test_generated.pdf', bytes);
  console.log('SUCCESS: Saved test_generated.pdf');
}

main().catch(console.error);

