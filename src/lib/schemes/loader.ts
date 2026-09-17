import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

export const SchemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  ministry: z.string(),
  category: z.string(),
  eligibility: z.record(z.string(), z.any()), // flexible object for criteria
  benefits: z.string(),
  documents_required: z.array(z.string()),
  application_process: z.array(z.string()),
  submission_url: z.string().optional(),
  form_template_path: z.string().optional()
});

export type Scheme = z.infer<typeof SchemeSchema>;

export async function loadSchemes(): Promise<Scheme[]> {
  const schemesDir = path.join(process.cwd(), 'data', 'schemes');
  const files = await fs.readdir(schemesDir);
  const schemes: Scheme[] = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const content = await fs.readFile(path.join(schemesDir, file), 'utf-8');
      const data = JSON.parse(content);
      const parsed = SchemeSchema.parse(data);
      schemes.push(parsed);
    }
  }

  return schemes;
}
