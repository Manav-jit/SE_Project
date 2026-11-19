import { NodeEvaluationResult, CounterfactualAdvice } from './types';

export function generateCounterfactuals(
  rootResult: NodeEvaluationResult
): CounterfactualAdvice[] {
  const counterfactuals: CounterfactualAdvice[] = [];

  function traverse(node: NodeEvaluationResult) {
    if (node.status === 'FAILED') {
      if (node.nodeType === 'COMPARISON') {
        const field = node.field || 'unknown';
        const curr = node.actualValue;
        const req = node.expectedValue;
        const unitStr = node.unit ? ` ${node.unit}` : '';

        let gapExplanation = '';
        let actionableStep = '';
        let alternativeSchemes: string[] = [];

        if (typeof curr === 'number' && typeof req === 'number') {
          const diff = Math.abs(curr - req);
          const diffFormatted = diff > 1000 ? `₹${diff.toLocaleString('en-IN')}` : `${diff}${unitStr}`;

          if (node.operator === '<=') {
            gapExplanation = `Current ${node.label} exceeds maximum allowable ceiling by ${diffFormatted}.`;
            actionableStep = `Requires reduction or deduction proof of ${diffFormatted} under taxable/gross income rules.`;
            if (field === 'income') {
              alternativeSchemes = ['pm_mudra', 'pm_egp'];
            }
          } else if (node.operator === '>=') {
            gapExplanation = `Current ${node.label} is below the required baseline by ${diffFormatted}.`;
            actionableStep = `Applicant must reach the minimum threshold of ${req}${unitStr}.`;
          }
        } else if (node.operator === 'IN') {
          gapExplanation = `Current ${node.label} ("${curr}") is not among approved categories (${Array.isArray(req) ? req.join(', ') : req}).`;
          actionableStep = `Check if you qualify under an alternative occupation or family member profile.`;
          if (field === 'occupation') {
            alternativeSchemes = ['mgnrega', 'atal_pension'];
          }
        } else if (node.operator === '==') {
          gapExplanation = `Current ${node.label} ("${curr}") does not match statutory requirement of "${req}".`;
          actionableStep = `Verify if another eligible family member can apply as the primary beneficiary.`;
        } else {
          gapExplanation = `Statutory condition "${node.label}" is violated.`;
          actionableStep = `Review official notification guidelines for allowable exemptions.`;
        }

        counterfactuals.push({
          failedNodeId: node.nodeId,
          field,
          label: node.label,
          currentValue: curr,
          requiredValue: req,
          gapExplanation,
          actionableStep,
          alternativeSchemes: alternativeSchemes.length > 0 ? alternativeSchemes : undefined,
        });
      } else if (node.nodeType === 'MUTUAL_EXCLUSION') {
        counterfactuals.push({
          failedNodeId: node.nodeId,
          field: 'enrolledSchemes',
          label: node.label,
          currentValue: node.actualValue,
          requiredValue: node.expectedValue,
          gapExplanation: node.explanation,
          actionableStep: 'Government rules prohibit concurrent disbursements. You must choose between these two entitlements.',
        });
      }
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(rootResult);
  return counterfactuals;
}

