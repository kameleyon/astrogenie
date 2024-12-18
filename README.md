# AstroGenie

A modern astrology application that combines traditional astrological calculations with AI-powered interpretations.

## Features

- **Swiss Ephemeris Integration**: Precise astronomical calculations for:
  - Planetary positions
  - House cusps and systems
  - Aspects and configurations
  - Transit calculations

- **House Systems Support**:
  - Placidus
  - Koch
  - Porphyry
  - Regiomontanus
  - Campanus
  - Equal House
  - Whole Sign
  - And more...

- **AI-Powered Interpretations**:
  - Dynamic house interpretations using OpenRouter/Gemini
  - Contextual analysis of planetary positions
  - Personalized astrological insights
  - Real-time aspect interpretations

- **Interactive Features**:
  - Birth chart wheel visualization
  - Transit tracking
  - Aspect pattern recognition
  - House strength and dignity calculations

## Technical Stack

- **Frontend**:
  - Next.js 13.5
  - TypeScript
  - Tailwind CSS
  - Framer Motion for animations

- **Astrological Calculations**:
  - Swiss Ephemeris for precise astronomical data
  - Custom algorithms for:
    - House calculations
    - Aspect pattern detection
    - Planetary strength evaluation
    - Dignity calculations

- **AI Integration**:
  - OpenRouter API
  - Gemini Flash 1.5 8B model
  - Dynamic content generation
  - Contextual interpretations

## Project Structure

```
lib/
  services/
    astro/           # Astrological calculation services
      aspects.ts     # Aspect calculations and patterns
      calculator.ts  # Main calculation coordinator
      houses.ts      # House system calculations
      planets.ts     # Planetary position calculations
      julian-date.ts # Date/time utilities
      types.ts       # TypeScript definitions
    openrouter/      # AI interpretation services
      index.ts       # OpenRouter API integration
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```env
OPENROUTER_API_KEY=your_api_key
```

3. Run the development server:
```bash
npm run dev
```

## Astrological Calculations

### Houses
- Accurate house cusp calculations using Swiss Ephemeris
- Support for multiple house systems
- House strength and dignity evaluations
- AI-generated interpretations based on:
  - House position
  - Occupying planets
  - Ruling planet position
  - Element and quality

### Aspects
- Precise aspect calculations
- Major and minor aspect pattern detection
- Dynamic aspect interpretations
- Strength and orb considerations

### Planets
- Exact planetary positions
- Retrograde detection
- Essential dignity calculations
- Speed and motion analysis

## Contributing

Contributions are welcome! Please read our contributing guidelines for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Swiss Ephemeris for astronomical calculations
- OpenRouter/Gemini for AI interpretations
- Contributors and maintainers
