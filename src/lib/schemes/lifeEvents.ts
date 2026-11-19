import { UserProfile } from '../chat/profile';

export interface LifeEventBundle {
  id: string;
  title: string;
  hindiTitle: string;
  tagline: string;
  hindiTagline: string;
  iconType: 'baby' | 'sprout' | 'graduation' | 'senior' | 'artisan';
  colorBg: string;
  colorBorder: string;
  schemeIds: string[];
  packageTotalValue: string;
  targetProfile: Partial<UserProfile>;
  description: string;
  hindiDescription: string;
  statutoryRationale: string;
}

export const LIFE_EVENT_BUNDLES: LifeEventBundle[] = [
  {
    id: 'maternity_childbirth',
    title: 'Newborn & Maternity',
    hindiTitle: 'नवजात शिशु एवं मातृत्व',
    tagline: 'Maternity DBT cash, sovereign girl asset & health protection',
    hindiTagline: 'मातृत्व डीबीटी, बालिका संप्रभु बचत एवं स्वास्थ्य सुरक्षा',
    iconType: 'baby',
    colorBg: '#FFF0F5',
    colorBorder: '#BE185D',
    schemeIds: ['pm_mvy', 'sukanya_samriddhi', 'ayushman_bharat'],
    packageTotalValue: '₹5,55,000 Package',
    targetProfile: {
      gender: 'Female',
      age: 26,
      occupation: 'Homemaker',
    },
    description: 'Statutory family bundle triggered upon pregnancy and childbirth, integrating MWCD and Health directives.',
    hindiDescription: 'गर्भावस्था और शिशु जन्म पर आधारित संयुक्त कल्याणकारी पैकेज।',
    statutoryRationale: 'MWCD Mission Shakti (PMMVY) + Govt Savings Promotion Act G.S.R. 323(E) + AB-PMJAY',
  },
  {
    id: 'agriculture_sowing',
    title: 'Crop Sowing & Agriculture',
    hindiTitle: 'कृषि एवं बुवाई मौसम',
    tagline: 'Direct farmer income, comprehensive crop insurance & seed investment',
    hindiTagline: 'किसान सीधी आय सहायता, फसल बीमा एवं निवेश सहायता',
    iconType: 'sprout',
    colorBg: '#F0FDF4',
    colorBorder: '#15803D',
    schemeIds: ['pm_kisan', 'pm_fasal_bima', 'rythu_bandhu'],
    packageTotalValue: '₹41,000 / yr',
    targetProfile: {
      occupation: 'Farmer',
      landHoldingHectares: 1.5,
      state: 'Uttar Pradesh',
    },
    description: 'Pre-season agricultural package providing liquidity and risk mitigation for cultivating landowners.',
    hindiDescription: 'बुवाई के समय किसानों के लिए सीधी सहायता और फसल सुरक्षा।',
    statutoryRationale: 'MoA&FW Gazette S.O. 1-1/2019-Credit-I + PMFBY Credit-II + State G.O. 13',
  },
  {
    id: 'higher_education',
    title: 'Student Higher Education',
    hindiTitle: 'विद्यार्थी उच्च शिक्षा',
    tagline: 'Merit stipends, school retention grants & post-matric tuition allowance',
    hindiTagline: 'मेधावी छात्रवृत्ति, स्कूल प्रोत्साहन एवं ट्यूशन भत्ता',
    iconType: 'graduation',
    colorBg: '#EFF6FF',
    colorBorder: '#1D4ED8',
    schemeIds: ['national_merit_scholarship', 'post_matric_scholarship'],
    packageTotalValue: '₹25,500 / academic yr',
    targetProfile: {
      occupation: 'Student',
      age: 15,
      caste: 'SC',
    },
    description: 'Centrally sponsored educational stipends aimed at preventing student dropouts in secondary schooling.',
    hindiDescription: 'माध्यमिक और उच्चतर कक्षाओं के लिए केंद्रीय छात्रवृत्ति पैकेज।',
    statutoryRationale: 'Ministry of Education NMMSS/2008 + MoSJE PMS-SC/2021',
  },
  {
    id: 'senior_security',
    title: 'Senior Citizen Social Security',
    hindiTitle: 'वरिष्ठ नागरिक सामाजिक सुरक्षा',
    tagline: 'Guaranteed non-contributory pensions, sovereign annuity & life cover',
    hindiTagline: 'मासिक वृद्धावस्था पेंशन, संप्रभु वार्षिकी एवं सुरक्षा बीमा',
    iconType: 'senior',
    colorBg: '#FAF5FF',
    colorBorder: '#7E22CE',
    schemeIds: ['nsap_old_age_pension', 'atal_pension', 'pm_jeevan_jyoti'],
    packageTotalValue: '₹48,000 / yr',
    targetProfile: {
      age: 65,
      occupation: 'Retired',
    },
    description: 'Comprehensive retirement protection covering direct monthly financial support and subsidized life protection.',
    hindiDescription: '60 वर्ष से अधिक आयु के नागरिकों के लिए मासिक पेंशन और जीवन सुरक्षा।',
    statutoryRationale: 'MoRD NSAP/IGNOAPS/1995 + PFRDA APY/2015 + DFS PMJJBY',
  },
  {
    id: 'micro_enterprise',
    title: 'Artisan & Micro-Enterprise',
    hindiTitle: 'कारीगर एवं सूक्ष्म उद्यम',
    tagline: 'Modern toolkit incentives, 5% collateral-free credit & digital cashback',
    hindiTagline: 'मुफ्त टूलकिट, 5% ब्याज पर बिना गारंटी ऋण एवं कैशबैक',
    iconType: 'artisan',
    colorBg: '#FFFBEB',
    colorBorder: '#B45309',
    schemeIds: ['pm_vishwakarma', 'pm_svanidhi', 'pm_mudra'],
    packageTotalValue: '₹90,000+ Subsidy & Credit',
    targetProfile: {
      occupation: 'Self-Employed',
      annualIncome: 140000,
    },
    description: 'Empowerment for traditional craftspeople, street vendors, and micro-entrepreneurs transitioning to formal finance.',
    hindiDescription: 'पारंपरिक शिल्पकारों और रेहड़ी-पटरी वालों के लिए आधुनिक उपकरण व ऋण सहायता।',
    statutoryRationale: 'MSME F.No. 1(1)/2023-PMV + MoHUA PMS/2020 + DFS PMMY',
  },
];

export function getLifeEventBundleById(id: string): LifeEventBundle | undefined {
  return LIFE_EVENT_BUNDLES.find((b) => b.id === id);
}
