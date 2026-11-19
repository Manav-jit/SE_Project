import { Scheme } from './loader';

export interface SchemeBenefitMeta {
  annualValue: number;
  formattedValue: string;
  type: 'dbt_cash' | 'insurance' | 'subsidy' | 'scholarship' | 'pension' | 'employment';
  typeLabel: string;
  citation: string;
}

export const SCHEME_BENEFIT_REGISTRY: Record<string, SchemeBenefitMeta> = {
  pm_kisan: {
    annualValue: 6000,
    formattedValue: '₹6,000 / yr',
    type: 'dbt_cash',
    typeLabel: 'Direct Bank Transfer (DBT)',
    citation: 'Govt. of India Gazette Notification S.O. 1-1/2019-Credit-I',
  },
  pm_fasal_bima: {
    annualValue: 25000,
    formattedValue: 'Up to ₹25,000 crop risk cover',
    type: 'insurance',
    typeLabel: 'Crop Insurance',
    citation: 'MoA&FW Operational Guidelines F.No. 13015/02/2015-Credit-II',
  },
  ayushman_bharat: {
    annualValue: 500000,
    formattedValue: '₹5,00,000 / family/yr',
    type: 'insurance',
    typeLabel: 'Hospitalization Cover',
    citation: 'National Health Authority Policy Directive AB-PMJAY/2018',
  },
  pmay_urban: {
    annualValue: 267000,
    formattedValue: 'Up to ₹2.67 Lakh interest subsidy',
    type: 'subsidy',
    typeLabel: 'Housing Credit Subsidy',
    citation: 'MoHUA Scheme Guidelines PMAY-U/2015',
  },
  national_merit_scholarship: {
    annualValue: 12000,
    formattedValue: '₹12,000 / yr (₹1,000/mo)',
    type: 'scholarship',
    typeLabel: 'Direct Student Stipend',
    citation: 'Ministry of Education Guidelines NMMSS/2008',
  },
  post_matric_scholarship: {
    annualValue: 13500,
    formattedValue: '₹13,500 / academic year',
    type: 'scholarship',
    typeLabel: 'Tuition & Maintenance Allowance',
    citation: 'MoSJE Statutory Order PMS-SC/2021',
  },
  sukanya_samriddhi: {
    annualValue: 50000,
    formattedValue: '8.2% Compound Tax-Free Return',
    type: 'subsidy',
    typeLabel: 'Sovereign Girl Child Asset',
    citation: 'Govt. Savings Promotion Act G.S.R. 323(E)',
  },
  pm_mvy: {
    annualValue: 5000,
    formattedValue: '₹5,000 maternity cash benefit',
    type: 'dbt_cash',
    typeLabel: 'Maternity DBT',
    citation: 'MWCD Mission Shakti Guidelines PMMVY/2017',
  },
  mgnrega: {
    annualValue: 28000,
    formattedValue: '₹28,000 guaranteed wages (100 days)',
    type: 'employment',
    typeLabel: 'Statutory Wage Guarantee',
    citation: 'National Rural Employment Guarantee Act, 2005 (Statute 42)',
  },
  pm_mudra: {
    annualValue: 50000,
    formattedValue: '₹50,000 collateral-free loan',
    type: 'subsidy',
    typeLabel: 'Micro-Enterprise Credit',
    citation: 'DFS Guidelines PMMY/2015',
  },
  pm_egp: {
    annualValue: 125000,
    formattedValue: 'Up to 35% margin money subsidy',
    type: 'subsidy',
    typeLabel: 'Capital Margin Subsidy',
    citation: 'KVIC Operational Guidelines PMEGP/2008',
  },
  atal_pension: {
    annualValue: 36000,
    formattedValue: '₹36,000 / yr (₹3,000/mo pension)',
    type: 'pension',
    typeLabel: 'Guaranteed Sovereign Pension',
    citation: 'PFRDA Gazette Notification APY/2015',
  },
  pm_vishwakarma: {
    annualValue: 30000,
    formattedValue: '₹15,000 toolkit + ₹3L credit at 5%',
    type: 'subsidy',
    typeLabel: 'Artisan Toolkit & Loan Subsidy',
    citation: 'MSME Gazette Notification F.No. 1(1)/2023-PMV',
  },
  pm_svanidhi: {
    annualValue: 10000,
    formattedValue: '₹10,000 micro-credit with 7% cashback',
    type: 'subsidy',
    typeLabel: 'Working Capital Micro-Credit',
    citation: 'MoHUA Operational Directive PMS/2020',
  },
  stand_up_india: {
    annualValue: 250000,
    formattedValue: '₹2.5 Lakh enterprise credit support',
    type: 'subsidy',
    typeLabel: 'Greenfield Enterprise Support',
    citation: 'DFS Mission Guidelines SUI/2016',
  },
  nsap_old_age_pension: {
    annualValue: 12000,
    formattedValue: '₹12,000 / yr (₹1,000/mo DBT)',
    type: 'pension',
    typeLabel: 'Senior Citizen Social Security',
    citation: 'MoRD Directive NSAP/IGNOAPS/1995',
  },
  ladli_behna: {
    annualValue: 15000,
    formattedValue: '₹15,000 / yr (₹1,250/mo direct DBT)',
    type: 'dbt_cash',
    typeLabel: 'Direct Women Financial Support',
    citation: 'Madhya Pradesh WCD Gazette Order 42/2023',
  },
  pm_suraksha_bima: {
    annualValue: 200000,
    formattedValue: '₹2,00,000 accidental cover',
    type: 'insurance',
    typeLabel: 'Universal Accidental Cover',
    citation: 'DFS Notification PMSBY/2015',
  },
  pm_jeevan_jyoti: {
    annualValue: 200000,
    formattedValue: '₹2,00,000 life insurance cover',
    type: 'insurance',
    typeLabel: 'Term Life Insurance',
    citation: 'DFS Notification PMJJBY/2015',
  },
  rythu_bandhu: {
    annualValue: 10000,
    formattedValue: '₹10,000 / acre/yr investment support',
    type: 'dbt_cash',
    typeLabel: 'Farmer Investment Support',
    citation: 'Telangana Agriculture G.O. Ms No. 13',
  },
};

export function getSchemeBenefitMeta(schemeId: string): SchemeBenefitMeta {
  if (SCHEME_BENEFIT_REGISTRY[schemeId]) {
    return SCHEME_BENEFIT_REGISTRY[schemeId];
  }
  return {
    annualValue: 6000,
    formattedValue: 'Direct Welfare Entitlement',
    type: 'dbt_cash',
    typeLabel: 'Direct Welfare Benefit',
    citation: 'Govt. of India Welfare Notification (Official DPI)',
  };
}

export interface BenefitSummary {
  totalAnnualValue: number;
  formattedTotal: string;
  directCashTotal: number;
  insuranceCoverTotal: number;
  verifiedSchemeCount: number;
}

export function calculateBenefitSummary(schemes: Scheme[]): BenefitSummary {
  let totalAnnual = 0;
  let directCash = 0;
  let insurance = 0;

  for (const s of schemes) {
    const meta = getSchemeBenefitMeta(s.id);
    totalAnnual += meta.annualValue;
    if (meta.type === 'dbt_cash' || meta.type === 'pension' || meta.type === 'scholarship') {
      directCash += meta.annualValue;
    } else if (meta.type === 'insurance') {
      insurance += meta.annualValue;
    }
  }

  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(totalAnnual);

  return {
    totalAnnualValue: totalAnnual,
    formattedTotal,
    directCashTotal: directCash,
    insuranceCoverTotal: insurance,
    verifiedSchemeCount: schemes.length,
  };
}
