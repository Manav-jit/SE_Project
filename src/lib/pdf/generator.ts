import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { UserProfile } from '../chat/profile';

export async function generateFilledForm(profile: UserProfile, schemeId: string): Promise<Uint8Array> {
  const templatePath = path.join(process.cwd(), 'data', 'templates', 'base_form.pdf');
  
  // Create template if it doesn't exist (failsafe for demo)
  try {
    await fs.access(templatePath);
  } catch {
    throw new Error("PDF Template not found. Please run the generation script.");
  }

  const pdfBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  // Field mapping
  const nameField = form.getTextField('applicant_name');
  if (profile.name) nameField.setText(profile.name);

  const ageField = form.getTextField('applicant_age');
  if (profile.age) ageField.setText(profile.age.toString());

  const genderField = form.getTextField('applicant_gender');
  if (profile.gender) genderField.setText(profile.gender);

  const stateField = form.getTextField('applicant_state');
  if (profile.state) stateField.setText(profile.state);
  
  const occupationField = form.getTextField('applicant_occupation');
  if (profile.occupation) occupationField.setText(profile.occupation);

  const incomeField = form.getTextField('applicant_income');
  if (profile.income) incomeField.setText(profile.income.toString());

  const schemeField = form.getTextField('scheme_id');
  schemeField.setText(schemeId);

  // Flatten the form so fields are no longer editable
  form.flatten();

  return await pdfDoc.save();
}
