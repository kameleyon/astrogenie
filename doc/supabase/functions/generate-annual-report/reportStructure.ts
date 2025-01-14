export const getMonthlyContent = (profile: any, currentYear: number) => {
  const months = [
    { name: 'January', transits: 'Jupiter in Taurus squares your natal position' },
    { name: 'February', transits: 'Venus enters Pisces, activating your relationship sector' },
    { name: 'March', transits: 'Mars in Aquarius brings career opportunities' },
    { name: 'April', transits: 'Solar Eclipse in Aries impacts your financial sector' },
    { name: 'May', transits: 'Mercury retrograde affects communication patterns' },
    { name: 'June', transits: 'Saturn in Pisces restructures home and family matters' },
    { name: 'July', transits: 'Lunar Eclipse in Capricorn transforms creative expression' },
    { name: 'August', transits: 'Venus direct in Leo enhances personal magnetism' },
    { name: 'September', transits: 'Mars in Libra activates partnerships' },
    { name: 'October', transits: 'Pluto direct intensifies transformation' },
    { name: 'November', transits: 'Jupiter returns to Sagittarius expanding horizons' },
    { name: 'December', transits: 'Saturn-Neptune conjunction brings vision into reality' }
  ];

  return months.map(month => `
${month.name} ${currentYear}
- Major Planetary Movements: ${month.transits}
- Impact on your ${profile.sun_sign} Sun Sign: How these transits activate your natal chart
- ${profile.moon_sign} Moon Sign Influences: Emotional themes and intuitive guidance
- ${profile.ascendant} Rising Sign Dynamics: How you'll navigate these energies
- ${profile.human_design_type} Strategy Application: Optimal decision-making timing
- Life Path ${profile.life_path_number} Integration: Aligning with your core purpose
- Birth Card ${profile.cardology_card} Activation: Key themes and opportunities

Practical Guidance:
- Best days for important decisions
- Areas requiring attention
- Growth opportunities
- Potential challenges to navigate
`).join('\n\n');
};