import { 
  Shield, Swords, Star, Award, Medal, Crown, ShieldAlert, 
  Flame, Zap, Gem, Trophy, Skull, Heart
} from "lucide-react";

export interface BadgeInfo {
  title: string;
  color: string;
  icon: any;
  special?: string;
  tier: string;
  subLevel?: number;
}

export const getBadgeInfo = (level: number): BadgeInfo => {
  // Logic to determine tier and sublevel based on level number
  // 1-3: Iron, 4-6: Bronze, etc.
  
  const tiers = [
    { name: "IRON", color: "from-slate-400 to-slate-600 border-slate-300 text-slate-100", icon: Shield },
    { name: "BRONZE", color: "from-amber-700 to-amber-900 border-amber-600 text-amber-300", icon: Award },
    { name: "SILVER", color: "from-slate-200 to-slate-400 border-slate-100 text-white", icon: Medal },
    { name: "GOLD", color: "from-yellow-400 to-yellow-600 border-yellow-300 text-yellow-100", icon: Star },
    { name: "PLATINUM", color: "from-cyan-400 to-blue-600 border-cyan-300 text-cyan-50", icon: Zap },
    { name: "DIAMOND", color: "from-blue-300 to-indigo-500 border-blue-200 text-white", icon: Gem },
    { name: "IMMORTAL", color: "from-red-500 to-rose-700 border-red-400 text-red-50", icon: Flame },
    { name: "RADIANT", color: "from-amber-200 to-yellow-400 border-yellow-100 text-amber-900", icon: Trophy },
    { name: "HERALD", color: "from-gray-700 to-black border-gray-500 text-gray-300", icon: Skull },
    { name: "GUARDIAN", color: "from-green-600 to-emerald-900 border-green-500 text-green-100", icon: ShieldAlert },
    { name: "CRUSADER", color: "from-blue-800 to-indigo-950 border-blue-600 text-blue-200", icon: Swords },
    { name: "ARCHON", color: "from-teal-500 to-teal-800 border-teal-400 text-teal-50", icon: Heart },
    { name: "ANCIENT", color: "from-purple-600 to-indigo-900 border-purple-400 text-purple-100", icon: Crown },
    { name: "DIVINE", color: "from-yellow-200 to-amber-500 border-white text-amber-950", icon: Star },
    { name: "BERBINTANG", color: "from-pink-400 to-rose-600 border-pink-300 text-white", icon: Star },
  ];

  if (level <= 45) {
    const tierIndex = Math.floor((level - 1) / 3);
    const subLevel = ((level - 1) % 3) + 1;
    const tier = tiers[tierIndex];
    
    return {
      title: `${tier.name} ${subLevel}`,
      tier: tier.name,
      subLevel,
      color: tier.color,
      icon: tier.icon
    };
  }

  // Special Levels
  if (level === 46) {
    return {
      title: "EPIC LEGENDARY",
      tier: "EPIC",
      color: "from-purple-600 via-fuchsia-500 to-indigo-900 border-fuchsia-300 text-white shadow-[0_0_30px_rgba(192,38,211,0.6)] animate-pulse",
      icon: Crown,
      special: "👑 MAHKOTA UNGU BERSAYAP JUBAH UNGU"
    };
  }

  if (level >= 47 && level <= 49) {
    const sub = level - 46;
    return {
      title: `RED LEGEND ${sub}`,
      tier: "RED LEGEND",
      color: "from-red-600 via-rose-500 to-orange-700 border-rose-300 text-white shadow-[0_0_40px_rgba(225,29,72,0.8)]",
      icon: Flame,
      special: "🐉 BERMAHKOTA BERTAMENG NAGA SAYAP MERAH BERCAHAYA"
    };
  }

  // Default fallback for very high levels
  return {
    title: `GODLIKE ${level}`,
    tier: "GODLIKE",
    color: "from-slate-900 via-gray-900 to-black border-white text-white",
    icon: Star
  };
};
