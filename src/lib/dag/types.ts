export type RuleValue = string | number | boolean | (string | number)[] | Record<string, unknown> | null | undefined;

export type ComparisonOperator = 
  | '>=' 
  | '<=' 
  | '==' 
  | '!=' 
  | '>' 
  | '<' 
  | 'IN' 
  | 'NOT_IN' 
  | 'BETWEEN';

export type LogicalOperator = 'AND' | 'OR' | 'NOT';

export type NodeStatus = 'PASSED' | 'FAILED' | 'MISSING_DATA' | 'PRUNED';

export type SchemeVerdict = 'ELIGIBLE' | 'INELIGIBLE' | 'CONDITIONAL_INCOMPLETE';

export interface ComparisonNode {
  id: string;
  type: 'COMPARISON';
  field: string;
  operator: ComparisonOperator;
  value: RuleValue;
  label: string;
  description?: string;
  unit?: string;
}

export interface LogicalNode {
  id: string;
  type: 'LOGICAL';
  operator: LogicalOperator;
  children: RuleNode[];
  label?: string;
}

export interface MutualExclusionNode {
  id: string;
  type: 'MUTUAL_EXCLUSION';
  conflictingSchemeIds: string[];
  label: string;
  description?: string;
}

export type RuleNode = ComparisonNode | LogicalNode | MutualExclusionNode;

export interface NodeEvaluationResult {
  nodeId: string;
  nodeType: 'COMPARISON' | 'LOGICAL' | 'MUTUAL_EXCLUSION';
  label: string;
  operator?: string;
  status: NodeStatus;
  actualValue?: RuleValue;
  expectedValue?: RuleValue;
  field?: string;
  unit?: string;
  explanation: string;
  children?: NodeEvaluationResult[];
}

export interface CounterfactualAdvice {
  failedNodeId: string;
  field: string;
  label: string;
  currentValue: RuleValue;
  requiredValue: RuleValue;
  gapExplanation: string;
  actionableStep: string;
  alternativeSchemes?: string[];
}

export interface SchemeDAGDefinition {
  schemeId: string;
  schemeName: string;
  category: string;
  ministry: string;
  rootRule: RuleNode;
}

export interface SchemeEvaluation {
  schemeId: string;
  schemeName: string;
  verdict: SchemeVerdict;
  rootResult: NodeEvaluationResult;
  passedCount: number;
  failedCount: number;
  missingCount: number;
  prunedCount: number;
  counterfactuals: CounterfactualAdvice[];
  summary: string;
  timestamp: string;
}

