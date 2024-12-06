import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Only planet symbols
const planetSymbols = [
  "☉", // Sun
  "☽", // Moon
  "☿", // Mercury
  "♀", // Venus
  "♂", // Mars
  "♃", // Jupiter
  "♄", // Saturn
  "⛢", // Uranus
  "♆", // Neptune
  "♇"  // Pluto
];

interface Symbol {
  id: number;
  char: string;
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotation: number;
}

export function AstrologicalSymbols() {
  const [symbols, setSymbols] = useState<Symbol[]>([]);

  useEffect(() => {
    const createSymbol = (id: number): Symbol => ({
      id,
      char: planetSymbols[id % planetSymbols.length],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      scale: Math.random() * 0.5 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      rotation: Math.random() * 360
    });

    // Create two instances of each planet symbol
    setSymbols(Array.from({ length: planetSymbols.length * 2 }, (_, i) => createSymbol(i)));

    // Update symbols periodically with smooth transitions
    const interval = setInterval(() => {
      setSymbols(prev => prev.map(symbol => ({
        ...symbol,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        rotation: Math.random() * 360
      })));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {symbols.map(symbol => (
        <motion.div
          key={symbol.id}
          initial={{ 
            x: symbol.x, 
            y: symbol.y, 
            opacity: 0, 
            scale: symbol.scale,
            rotate: symbol.rotation 
          }}
          animate={{ 
            x: symbol.x, 
            y: symbol.y, 
            opacity: symbol.opacity,
            scale: symbol.scale,
            rotate: symbol.rotation
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 5,
            ease: "easeInOut"
          }}
          className="absolute text-7xl text-white/20 font-serif select-none"
        >
          {symbol.char}
        </motion.div>
      ))}
    </div>
  );
}

export default AstrologicalSymbols;
