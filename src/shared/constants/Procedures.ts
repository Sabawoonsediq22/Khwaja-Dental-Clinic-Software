export interface ProcedureConstant {
  name: string;
  price: number;
  price_afn: number;
  price_usd: number;
}

export const PROCEDURES: ProcedureConstant[] = [
  { name: "Examination", price: 200, price_afn: 200, price_usd: 0 },
  { name: "Simple Filling", price: 1500, price_afn: 1500, price_usd: 0 },
  { name: "RCT", price: 2000, price_afn: 2000, price_usd: 0 },
  { name: "Zirconium Crown", price: 100, price_afn: 0, price_usd: 100 },
  { name: "PMF Crown", price: 2000, price_afn: 2000, price_usd: 0 },
  { name: "Metal Crown", price: 1500, price_afn: 1500, price_usd: 0 },
  { name: "Veneer Direct", price: 2000, price_afn: 2000, price_usd: 0 },
  { name: "Extraction (Simple)", price: 500, price_afn: 500, price_usd: 0 },
  { name: "Extraction (Complex)", price: 1500, price_afn: 1500, price_usd: 0 },
  { name: "Extraction (Surgical)", price: 3000, price_afn: 3000, price_usd: 0 },
  { name: "Mucocele Removing", price: 5000, price_afn: 5000, price_usd: 0 },
  { name: "Crown Lengthening", price: 1500, price_afn: 1500, price_usd: 0 },
  { name: "RCT + Post Corel + Crown", price: 5000, price_afn: 5000, price_usd: 0 },
  { name: "Dentures Upper Lower", price: 30000, price_afn: 30000, price_usd: 0 },
  { name: "Orthodontics (Basic)", price: 300, price_afn: 0, price_usd: 300 },
  { name: "Orthodontics (Standard)", price: 400, price_afn: 0, price_usd: 400 },
  { name: "Orthodontics Visit", price: 1500, price_afn: 1500, price_usd: 0 },
  { name: "Implant Surgery Only (Standard)", price: 400, price_afn: 0, price_usd: 400 },
  { name: "Implant Surgery Only (Premium)", price: 500, price_afn: 0, price_usd: 500 },
  { name: "Scaling & Polishing", price: 1500, price_afn: 1500, price_usd: 0 },
  { name: "Bleaching", price: 100, price_afn: 0, price_usd: 100 },
  { name: "Old Crown Cementation Fee", price: 150, price_afn: 150, price_usd: 0 },
];

export const DOLLAR_PROCEDURE_NAMES = PROCEDURES
  .filter(p => p.price_usd > 0)
  .map(p => p.name);
