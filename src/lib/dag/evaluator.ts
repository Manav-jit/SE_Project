import { 
  RuleNode, 
  ComparisonNode, 
  LogicalNode, 
  MutualExclusionNode, 
  NodeEvaluationResult, 
  SchemeEvaluation, 
  SchemeVerdict,
  SchemeDAGDefinition,
  RuleValue
} from './types';
import { generateCounterfactuals } from './counterfactual';

export function evaluateComparison(
  node: ComparisonNode,
  profile: Record<string, unknown>
): NodeEvaluationResult {
  const rawActual = profile[node.field];
  
  // Check if profile value is missing
  if (rawActual === undefined || rawActual === null || rawActual === '') {
    return {
      nodeId: node.id,
      nodeType: 'COMPARISON',
      label: node.label,
      operator: node.operator,
      status: 'MISSING_DATA',
      field: node.field,
      expectedValue: node.value,
      unit: node.unit,
      explanation: `Information for "${node.label}" is missing from citizen profile.`,
    };
  }

  const actual = rawActual;
  const expected = node.value;
  let passed = false;

  switch (node.operator) {
    case '>=':
      passed = Number(actual) >= Number(expected);
      break;
    case '<=':
      passed = Number(actual) <= Number(expected);
      break;
    case '>':
      passed = Number(actual) > Number(expected);
      break;
    case '<':
      passed = Number(actual) < Number(expected);
      break;
    case '==':
      if (typeof actual === 'string' && typeof expected === 'string') {
        passed = actual.trim().toLowerCase() === expected.trim().toLowerCase();
      } else {
        passed = actual === expected;
      }
      break;
    case '!=':
      if (typeof actual === 'string' && typeof expected === 'string') {
        passed = actual.trim().toLowerCase() !== expected.trim().toLowerCase();
      } else {
        passed = actual !== expected;
      }
      break;
    case 'IN':
      if (Array.isArray(expected)) {
        const needle = String(actual).trim().toLowerCase();
        passed = expected.some((item) => String(item).trim().toLowerCase() === needle);
      }
      break;
    case 'NOT_IN':
      if (Array.isArray(expected)) {
        const needle = String(actual).trim().toLowerCase();
        passed = !expected.some((item) => String(item).trim().toLowerCase() === needle);
      }
      break;
    case 'BETWEEN':
      if (Array.isArray(expected) && expected.length === 2) {
        const val = Number(actual);
        passed = val >= Number(expected[0]) && val <= Number(expected[1]);
      }
      break;
  }

  const formatVal = (v: unknown): string => {
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'number' && v > 1000) return v.toLocaleString('en-IN');
    return String(v ?? '');
  };

  const explanation = passed
    ? `✓ Satisfied: Current ${node.label} (${formatVal(actual)}${node.unit ? ' ' + node.unit : ''}) satisfies rule (${node.operator} ${formatVal(expected)}${node.unit ? ' ' + node.unit : ''}).`
    : `✗ Violated: Current ${node.label} (${formatVal(actual)}${node.unit ? ' ' + node.unit : ''}) does not meet requirement (${node.operator} ${formatVal(expected)}${node.unit ? ' ' + node.unit : ''}).`;

  return {
    nodeId: node.id,
    nodeType: 'COMPARISON',
    label: node.label,
    operator: node.operator,
    status: passed ? 'PASSED' : 'FAILED',
    field: node.field,
    actualValue: actual as RuleValue,
    expectedValue: expected as RuleValue,
    unit: node.unit,
    explanation,
  };
}

export function evaluateLogical(
  node: LogicalNode,
  profile: Record<string, unknown>
): NodeEvaluationResult {
  const childResults: NodeEvaluationResult[] = [];

  if (node.operator === 'NOT') {
    const child = node.children[0];
    const childResult = child ? evaluateNode(child, profile) : null;
    if (!childResult) {
      return {
        nodeId: node.id,
        nodeType: 'LOGICAL',
        label: node.label || 'NOT Clause',
        operator: 'NOT',
        status: 'FAILED',
        explanation: 'Invalid NOT node with no child.',
      };
    }

    const invertedStatus =
      childResult.status === 'PASSED'
        ? 'FAILED'
        : childResult.status === 'FAILED'
        ? 'PASSED'
        : childResult.status;

    return {
      nodeId: node.id,
      nodeType: 'LOGICAL',
      label: node.label || `NOT (${childResult.label})`,
      operator: 'NOT',
      status: invertedStatus,
      explanation: `Inversion clause: child evaluated to ${childResult.status}.`,
      children: [childResult],
    };
  }

  // Handle AND
  if (node.operator === 'AND') {
    let hasFailed = false;
    let hasMissing = false;

    for (const child of node.children) {
      const res = evaluateNode(child, profile);
      childResults.push(res);
      if (res.status === 'FAILED') hasFailed = true;
      if (res.status === 'MISSING_DATA') hasMissing = true;
    }

    const status = hasFailed ? 'FAILED' : hasMissing ? 'MISSING_DATA' : 'PASSED';
    const explanation =
      status === 'PASSED'
        ? `✓ All ${node.children.length} mandatory criteria satisfied.`
        : hasFailed
        ? `✗ One or more mandatory criteria failed.`
        : `? Some mandatory criteria require missing profile information.`;

    return {
      nodeId: node.id,
      nodeType: 'LOGICAL',
      label: node.label || `All of the following must apply (${node.children.length} rules)`,
      operator: 'AND',
      status,
      explanation,
      children: childResults,
    };
  }

  // Handle OR
  if (node.operator === 'OR') {
    let hasPassed = false;
    let hasMissing = false;

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      // If we already passed, subsequent alternative branches can be evaluated or marked PRUNED
      if (hasPassed) {
        childResults.push({
          nodeId: child.id,
          nodeType: child.type,
          label: child.label || 'Alternative branch',
          status: 'PRUNED',
          explanation: 'Short-circuited (alternative branch already satisfied).',
        });
        continue;
      }

      const res = evaluateNode(child, profile);
      childResults.push(res);

      if (res.status === 'PASSED') {
        hasPassed = true;
      } else if (res.status === 'MISSING_DATA') {
        hasMissing = true;
      }
    }

    const status = hasPassed ? 'PASSED' : hasMissing ? 'MISSING_DATA' : 'FAILED';
    const explanation = hasPassed
      ? `✓ At least one qualifying path satisfied.`
      : hasMissing
      ? `? Missing details for alternative qualifications.`
      : `✗ None of the qualifying options were satisfied.`;

    return {
      nodeId: node.id,
      nodeType: 'LOGICAL',
      label: node.label || `At least one of the following must apply`,
      operator: 'OR',
      status,
      explanation,
      children: childResults,
    };
  }

  return {
    nodeId: node.id,
    nodeType: 'LOGICAL',
    label: node.label || 'Unknown Logical Clause',
    status: 'FAILED',
    explanation: 'Unsupported logical operator',
  };
}

export function evaluateMutualExclusion(
  node: MutualExclusionNode,
  profile: Record<string, unknown>
): NodeEvaluationResult {
  const activeEnrolled: string[] = Array.isArray(profile.enrolledSchemes)
    ? (profile.enrolledSchemes as string[])
    : [];

  const conflictingFound = node.conflictingSchemeIds.filter((id) =>
    activeEnrolled.includes(id)
  );

  const passed = conflictingFound.length === 0;

  return {
    nodeId: node.id,
    nodeType: 'MUTUAL_EXCLUSION',
    label: node.label,
    status: passed ? 'PASSED' : 'FAILED',
    actualValue: activeEnrolled,
    expectedValue: `Not enrolled in: ${node.conflictingSchemeIds.join(', ')}`,
    explanation: passed
      ? `✓ No conflicting government welfare enrollments detected.`
      : `✗ Conflict detected: Beneficiary is already enrolled in ${conflictingFound.join(', ')}, which prohibits this scheme.`,
  };
}

export function evaluateNode(
  node: RuleNode,
  profile: Record<string, unknown>
): NodeEvaluationResult {
  switch (node.type) {
    case 'COMPARISON':
      return evaluateComparison(node, profile);
    case 'LOGICAL':
      return evaluateLogical(node, profile);
    case 'MUTUAL_EXCLUSION':
      return evaluateMutualExclusion(node, profile);
    default:
      return {
        nodeId: 'unknown',
        nodeType: 'LOGICAL',
        label: 'Unknown',
        status: 'FAILED',
        explanation: 'Invalid rule node type',
      };
  }
}

function countNodes(result: NodeEvaluationResult) {
  let passed = 0;
  let failed = 0;
  let missing = 0;
  let pruned = 0;

  if (result.nodeType === 'COMPARISON' || result.nodeType === 'MUTUAL_EXCLUSION') {
    if (result.status === 'PASSED') passed++;
    else if (result.status === 'FAILED') failed++;
    else if (result.status === 'MISSING_DATA') missing++;
    else if (result.status === 'PRUNED') pruned++;
  }

  if (result.children) {
    for (const child of result.children) {
      const counts = countNodes(child);
      passed += counts.passed;
      failed += counts.failed;
      missing += counts.missing;
      pruned += counts.pruned;
    }
  }

  return { passed, failed, missing, pruned };
}

export function evaluateSchemeDAG(
  dag: SchemeDAGDefinition,
  profile: Record<string, unknown>
): SchemeEvaluation {
  const rootResult = evaluateNode(dag.rootRule, profile);
  const counts = countNodes(rootResult);

  let verdict: SchemeVerdict = 'ELIGIBLE';
  if (rootResult.status === 'FAILED') {
    verdict = 'INELIGIBLE';
  } else if (rootResult.status === 'MISSING_DATA') {
    verdict = 'CONDITIONAL_INCOMPLETE';
  }

  const counterfactuals = generateCounterfactuals(rootResult);

  let summary = '';
  if (verdict === 'ELIGIBLE') {
    summary = `Formal proof confirmed: Citizen satisfies all ${counts.passed} verified statutory criteria with 0 contradictions.`;
  } else if (verdict === 'INELIGIBLE') {
    summary = `Eligibility rejected by formal verification. ${counts.failed} critical rule(s) violated.`;
  } else {
    summary = `Evaluation incomplete: ${counts.missing} demographic field(s) must be provided to determine entitlement.`;
  }

  return {
    schemeId: dag.schemeId,
    schemeName: dag.schemeName,
    verdict,
    rootResult,
    passedCount: counts.passed,
    failedCount: counts.failed,
    missingCount: counts.missing,
    prunedCount: counts.pruned,
    counterfactuals,
    summary,
    timestamp: new Date().toISOString(),
  };
}

