"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MapPin, Clock, CircleUserRound, Sparkles, CalendarDays } from "lucide-react";
import { BirthChartData } from "@/lib/types/birth-chart";
import { LocationSearch } from "./location-search";

interface BirthChartFormProps {
  onSubmit: (data: BirthChartData) => void;
}

export function BirthChartForm({ onSubmit }: BirthChartFormProps) {
  const [date, setDate] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<{ name: string; coordinates: [number, number] }>();
  const [timeKnown, setTimeKnown] = useState("yes");
  const [name, setName] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !location) return;

    const mockData: BirthChartData = {
      sunSign: "Leo",
      moonSign: "Pisces",
      ascendant: "Virgo",
      planets: [
        { name: "Sun", sign: "Leo", house: 11 },
        { name: "Moon", sign: "Pisces", house: 6 },
        { name: "Mercury", sign: "Virgo", house: 12 },
      ],
    };

    onSubmit(mockData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="backdrop-blur-sm rounded-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 flex-col justify-center items-center">
        <div className="relative w-full">
          <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none ${name ? 'hidden' : 'block'}`}>
            <CircleUserRound className="w-4 h-4 text-gray-400 dark:text-white/40" />
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="border border-gray-200 dark:border-white/10 h-11 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/30 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-[#FFA600]/50 pl-10"
          />
        </div>

        <div className="relative w-full">
          <div className="flex items-center border border-gray-200 dark:border-white/10 h-11 rounded-xl focus-within:ring-1 focus-within:ring-[#FFA600]/50">
            <div className="pl-3">
              <CalendarDays className="w-4 h-4 text-gray-400 dark:text-white/40" />
            </div>
            <input
              type="date"
              value={date || ""}
              onChange={(e) => setDate(e.target.value)}
              max={format(new Date(), "yyyy-MM-dd")}
              placeholder="mm/dd/yyyy"
              className="bg-transparent border-0 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 text-sm rounded-xl focus:outline-none focus:ring-0 pl-4 pr-4 w-full h-11"
            />
          </div>
        </div>

        <div className="relative w-full">
          <LocationSearch onLocationSelect={(loc) => setLocation(loc)} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-4 text-sm text-gray-900 dark:text-white/70">
            <span className="text-sm font-light">Birth Time</span>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="timeKnown"
                value="yes"
                checked={timeKnown === "yes"}
                onChange={(e) => setTimeKnown(e.target.value)}
                className="text-[#FFA600] focus:ring-[#FFA600]/50"
              />
              <span>Known</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="timeKnown"
                value="no"
                checked={timeKnown === "no"}
                onChange={(e) => setTimeKnown(e.target.value)}
                className="text-[#FFA600] focus:ring-[#FFA600]/50"
              />
              <span>Unknown</span>
            </label>
          </div>
          <div className="relative w-full">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Clock className="w-4 h-4 text-gray-400 dark:text-white/40" />
            </div>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={timeKnown === "no"}
              placeholder="--:-- --"
              className="border border-gray-200 dark:border-white/10 h-11 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-[#FFA600]/50 pl-10"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-[#D15200] to-[#FFA600] hover:opacity-90 text-white font-medium mt-2"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Birth Chart
        </Button>
      </form>
    </motion.div>
  );
}
