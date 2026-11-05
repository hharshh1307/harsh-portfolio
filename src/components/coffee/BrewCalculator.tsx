"use client";

import { useId, useState } from "react";

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Pour-over ratio calculator: pick a dose and a ratio, get the water and a simple pour schedule
 * (bloom at 2× the dose, then two even pours). A starting point, not a law.
 */
export function BrewCalculator({ defaultCoffee = 18, defaultRatio = 16 }: { defaultCoffee?: number; defaultRatio?: number }) {
  const [coffee, setCoffee] = useState(defaultCoffee);
  const [ratio, setRatio] = useState(defaultRatio);
  const id = useId();

  const water = Math.round(coffee * ratio);
  const bloom = Math.round(coffee * 2);
  const half = Math.round(bloom + (water - bloom) / 2);
  const steps = [
    { t: 0, label: `Bloom with ${bloom} g`, total: bloom },
    { t: 45, label: `Pour to ${half} g`, total: half },
    { t: 90, label: `Pour to ${water} g`, total: water },
    { t: 180, label: "Drawdown done around here", total: water },
  ];

  return (
    <div className="rounded-3xl border border-[#2b1d12]/15 bg-[#f3e6d3] p-6 text-[#2b1d12] sm:p-8 dark:border-white/10 dark:bg-[#231a13] dark:text-[#efe0cc]">
      <p className="label !text-current opacity-70">Brew calculator</p>
      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div className="space-y-7">
          <div>
            <label htmlFor={`${id}-coffee`} className="flex items-baseline justify-between">
              <span>Coffee</span>
              <span className="display text-3xl">{coffee} g</span>
            </label>
            <input
              id={`${id}-coffee`}
              type="range"
              min={8}
              max={40}
              value={coffee}
              onChange={(e) => setCoffee(Number(e.target.value))}
              className="mt-3 w-full accent-[#8a4b2a]"
            />
          </div>
          <div>
            <label htmlFor={`${id}-ratio`} className="flex items-baseline justify-between">
              <span>Ratio</span>
              <span className="display text-3xl">1 : {ratio}</span>
            </label>
            <input
              id={`${id}-ratio`}
              type="range"
              min={12}
              max={18}
              step={0.5}
              value={ratio}
              onChange={(e) => setRatio(Number(e.target.value))}
              className="mt-3 w-full accent-[#8a4b2a]"
            />
            <p className="mt-2 text-sm opacity-70">
              {ratio <= 14 ? "Strong and syrupy" : ratio <= 16 ? "Balanced" : "Light and tea-like"}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm opacity-70">Water</p>
          <p className="display text-6xl" aria-live="polite">
            {water} g
          </p>
          <ol className="mt-6 space-y-2.5">
            {steps.map((s) => (
              <li key={s.t} className="flex items-baseline gap-4">
                <span className="w-10 shrink-0 font-mono text-xs opacity-70">{fmtTime(s.t)}</span>
                <span>{s.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
