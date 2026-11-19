# TASK-04: Scheme Catalog Expansion (20 Schemes)

## Objective
Expand the scheme catalog from 12 schemes to 20 comprehensive central and state government schemes across diverse demographics (artisans, street vendors, women, elderly, students, and micro-entrepreneurs) with full JSON metadata and statutory DAG definitions.

## Key Deliverables
1. **New Schemes in `data/schemes/`**:
   1. `pm_vishwakarma.json` (Traditional artisans & craftspeople collateral-free credit & modern toolkits)
   2. `pm_svanidhi.json` (Street vendors micro-credit working capital scheme)
   3. `stand_up_india.json` (SC/ST and women entrepreneurs greenfield enterprise funding)
   4. `nsap_old_age_pension.json` (National Social Assistance Programme - Indira Gandhi National Old Age Pension)
   5. `ladli_behna.json` (Financial independence & nutrition support for women)
   6. `pm_suraksha_bima.json` (Accidental death and disability insurance)
   7. `pm_jeevan_jyoti.json` (Life insurance for savings bank account holders)
   8. `rythu_bandhu.json` (Agricultural investment support for farmers)
2. **Formal DAG Definitions in `src/lib/dag/rules.ts`**:
   - Write statutory rule trees for all 8 new schemes with criteria (age limits, occupation matches, income ceilings, land ownership constraints).
3. **Category Linkage**:
   - Ensure all 20 schemes map cleanly into existing categories (Agriculture, Healthcare, Housing, Education, Women & Child, Employment, Social Security, Financial Services).

## Verification
- Run `npx tsx scripts/test-dag.ts` to ensure all 20 scheme DAGs evaluate without error.
- Run `npx tsx scripts/test-retrieval.ts` to confirm new schemes are retrievable by profile.
- Verify categories page reflects new counts accurately.
