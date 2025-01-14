import { getMonthlyContent } from './reportStructure.ts';

export const generateReportContent = (profile: any, currentYear: number) => {
  const openingSection = `
Annual Forecast Report for ${profile.full_name || 'our valued client'}

Initial Data Overview:
Birth Chart Configuration: ${profile.sun_sign} Sun, ${profile.moon_sign} Moon, ${profile.ascendant} Rising
Human Design Type: ${profile.human_design_type}
Life Path Number: ${profile.life_path_number}
Birth Card: ${profile.cardology_card}

Personal Year Overview for ${currentYear}
Your ${profile.sun_sign} sun sign's natural strengths are particularly highlighted this year, while your ${profile.moon_sign} moon adds emotional depth to your journey. As someone with ${profile.ascendant} rising, you'll find yourself navigating the year's energies with unique perspective and grace.`;

  const monthlyBreakdowns = getMonthlyContent(profile, currentYear);

  const closingSection = `
Power Periods & Growth Opportunities
- Key favorable periods based on your ${profile.sun_sign} and ${profile.moon_sign} transits
- Peak cycles connected to your Life Path Number ${profile.life_path_number}
- Growth opportunities aligned with your ${profile.cardology_card}
- Optimal timing for major decisions based on your ${profile.human_design_type} strategy

This forecast is crafted specifically for your unique cosmic blueprint. Trust in your inner wisdom as you navigate the opportunities and challenges ahead.`;

  return `${openingSection}\n\n${monthlyBreakdowns}\n\n${closingSection}`;
};