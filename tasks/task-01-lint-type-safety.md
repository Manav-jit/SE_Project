# TASK-01: Type Safety & Lint Cleanup

## Objective
Fix all 58 ESLint and TypeScript issues across the codebase so that `npm run lint` and `npm run build` pass with 0 errors and 0 warnings.

## Scope of Changes
1. **`src/lib/dag/` (`types.ts`, `evaluator.ts`, `counterfactual.ts`)**:
   - Replace `any` in node evaluations, rule comparison values, and profiles with concrete interfaces or generics (`unknown`, `Record<string, unknown>`).
   - Remove unused imports (`UserProfile`, `profile` variable).
2. **`src/components/dag/` (`ProofGraphModal.tsx`, `TreeNodeCard.tsx`)**:
   - Resolve unused imports (`ChevronRight`, `AlertCircle`, `sliders`).
   - Add proper type signatures for event handlers and node rendering props.
3. **`src/app/categories/[category]/page.tsx`**:
   - Resolve `react-hooks/set-state-in-effect` by using `useMemo` or moving profile initialization safely.
4. **`src/app/api/chat/route.ts` & `src/app/api/generate-pdf/route.ts`**:
   - Fix `any` on error catches (`unknown` with `instanceof Error` or custom type guard).
   - Clean up unused variables (`e`).
5. **`src/components/ActionPlanModal.tsx` & `src/components/SchemeCard.tsx`**:
   - Fix typing on callbacks and handlers.
6. **`scripts/`**:
   - Clean up `any` types in scripts.

## Verification
- Run `npm run lint` -> Must return exit code 0.
- Run `npm run build` -> Must succeed with zero type or lint errors.
