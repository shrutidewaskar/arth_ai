import React from "react";

const STREAM_COLUMNS = [
  {
    animation: "animate-stream-up-1",
    items: [
      "₹1,45,000",
      "+14.8% CAGR",
      "DTI: 28.4%",
      "RUNWAY: 6.2M",
      "₹12,50,000",
      "SIP: ₹15,000",
      "SURPLUS: +₹38,200",
      "NET WORTH: ₹1.42CR",
      "GOLD: 250g",
      "EQUITY: 65%",
      "TAX SAVED: ₹48,000",
      "HEALTH: 84/100",
      "PPF: ₹1.5L",
      "FEASIBILITY: 94%",
      "FD: 7.4%",
      "EMI: ₹32,400",
    ],
  },
  {
    animation: "animate-stream-down-1",
    items: [
      "₹85,000/mo",
      "RUNWAY: 8.5M",
      "SAVINGS: 34%",
      "₹35,00,000",
      "DTI: 19.2%",
      "CAGR: +12.4%",
      "HEALTH: 91/100",
      "SURPLUS: +₹52,000",
      "₹4,80,000",
      "TAX: NEW REGIME",
      "SIP: ₹25,000",
      "NET WORTH: ₹88.5L",
      "DEBT: 0.0%",
      "BUFFER: ₹6.0L",
      "GOAL: RETIRE 2040",
      "YIELD: 9.8%",
    ],
  },
  {
    animation: "animate-stream-up-2",
    items: [
      "+18.2% YTD",
      "₹2,10,000",
      "GOLD: ₹18.5L",
      "HEALTH: 78/100",
      "DTI: 33.1%",
      "SURPLUS: +₹29,400",
      "RUNWAY: 5.1M",
      "SIP: ₹18,000",
      "₹50,00,000",
      "TERM COVER: ₹1.5CR",
      "EPF: ₹14.2L",
      "SAVINGS: 29%",
      "TAX SAVED: ₹62,400",
      "EMERGENCY: ₹5.5L",
      "MUTUAL FUNDS: ₹24L",
      "FEASIBILITY: ON TRACK",
    ],
  },
  {
    animation: "animate-stream-down-2",
    items: [
      "₹1,20,000",
      "RUNWAY: 10.2M",
      "DTI: 14.5%",
      "CAGR: +15.1%",
      "NET WORTH: ₹2.15CR",
      "SURPLUS: +₹64,000",
      "HEALTH: 95/100",
      "SIP: ₹30,000",
      "₹75,00,000",
      "HOME LOAN: 8.4%",
      "GOLD LOAN: 7.8%",
      "BUFFER: ₹9.0L",
      "TAX: OLD VS NEW",
      "FEASIBILITY: 98%",
      "SAVINGS: 42%",
      "FD: ₹12.0L",
    ],
  },
  {
    animation: "animate-stream-up-3",
    items: [
      "₹95,000",
      "+13.5% CAGR",
      "HEALTH: 88/100",
      "RUNWAY: 7.4M",
      "DTI: 22.0%",
      "SURPLUS: +₹41,500",
      "₹18,00,000",
      "SIP: ₹12,500",
      "NET WORTH: ₹1.05CR",
      "EQUITY: 70%",
      "SAVINGS: 31%",
      "TAX SAVED: ₹36,000",
      "PPF: ₹8.4L",
      "GOLD: 150g",
      "FEASIBILITY: SAFE",
      "EMI: ₹18,500",
    ],
  },
  {
    animation: "animate-stream-down-3",
    items: [
      "₹2,50,000",
      "RUNWAY: 12.0M",
      "SAVINGS: 45%",
      "DTI: 11.8%",
      "HEALTH: 96/100",
      "CAGR: +16.2%",
      "SURPLUS: +₹82,000",
      "NET WORTH: ₹3.40CR",
      "SIP: ₹45,000",
      "₹1,00,00,000",
      "TERM COVER: ₹2.0CR",
      "BUFFER: ₹15.0L",
      "TAX SAVED: ₹85,000",
      "MUTUAL FUNDS: ₹42L",
      "FEASIBILITY: 100%",
      "FD: 7.6%",
    ],
  },
];

export function FinancialNumbersBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0 mask-[linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] opacity-[0.045] hover:opacity-[0.07] transition-opacity duration-1000"
    >
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 h-full w-full max-w-7xl mx-auto px-4 font-mono text-[11px] font-bold text-emerald-950 tracking-wider">
        {STREAM_COLUMNS.map((col, colIdx) => (
          <div key={colIdx} className="relative overflow-hidden h-full flex flex-col justify-start">
            <div className={`flex flex-col gap-6 ${col.animation}`}>
              {/* Double the list for seamless continuous infinite loop */}
              {[...col.items, ...col.items].map((item, idx) => (
                <span
                  key={idx}
                  className="whitespace-nowrap py-1 border-b border-emerald-950/10 block"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
