import Link from "next/link";
import { Vault, Database, Shield, Zap, Globe } from "lucide-react";


export default function Footer() {
 return (
   <footer className="relative mt-24 border-t border-[rgba(0,212,255,0.08)] bg-[rgba(4,8,16,0.97)] text-slate-400">
     <div className="glow-divider" />


     <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
       <div className="grid grid-cols-1 gap-10 md:grid-cols-4">


         {/* Brand Column */}
         <div className="md:col-span-1">
           <div className="flex items-center gap-2.5">
             <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(0,212,255,0.22)] bg-[rgba(0,212,255,0.08)] shadow-[0_0_16px_rgba(0,212,255,0.12)]">
               <Vault className="h-4 w-4 text-[#00D4FF]" strokeWidth={2} />
             </div>
             <span className="text-lg font-black tracking-tight text-white">
               Daily<span className="text-cyan-gradient">Vault</span>
               <span className="text-gold-gradient">Rates</span>
             </span>
           </div>


           <p className="mt-4 text-xs leading-relaxed text-slate-500">
             Open financial data platform delivering automated daily spot rate archives for precious metals and global exchange rates.
           </p>


           <div className="mt-5 flex items-center gap-2">
             {[
               { icon: Shield, label: "Verified" },
               { icon: Zap, label: "Daily" },
               { icon: Globe, label: "Global" },
             ].map(({ icon: Icon, label }) => (
               <div key={label} className="flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-[10px] font-semibold text-slate-400">
                 <Icon className="h-3 w-3 text-[#00D4FF]" />
                 {label}
               </div>
             ))}
           </div>
         </div>


         {/* Metals Links */}
         <div>
           <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#F0B429]">Precious Metals</h3>
           <div className="mt-3 h-px w-full bg-gradient-to-r from-[rgba(240,180,41,0.35)] to-transparent" />
           <ul className="mt-4 space-y-2.5 text-xs">
             {["Gold Spot Rate (XAU)", "Silver Spot Rate (XAG)", "Platinum Price Index (XPT)", "Aluminum Spot Rate (ALI)"].map((label) => (
               <li key={label}>
                 <Link href="/" className="flex items-center gap-2 text-slate-500 transition-colors hover:text-[#F0B429]">
                   <span className="h-1 w-1 rounded-full bg-[rgba(240,180,41,0.50)]" />
                   {label}
                 </Link>
               </li>
             ))}
           </ul>
         </div>


         {/* Forex Links */}
         <div>
           <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#00D4FF]">Currencies &amp; FX</h3>
           <div className="mt-3 h-px w-full bg-gradient-to-r from-[rgba(0,212,255,0.35)] to-transparent" />
           <ul className="mt-4 space-y-2.5 text-xs">
             {["EUR / USD Rate", "GBP / USD Rate", "USD / JPY Rate", "USD / INR Rate"].map((label) => (
               <li key={label}>
                 <Link href="/" className="flex items-center gap-2 text-slate-500 transition-colors hover:text-[#00D4FF]">
                   <span className="h-1 w-1 rounded-full bg-[rgba(0,212,255,0.50)]" />
                   {label}
                 </Link>
               </li>
             ))}
           </ul>
         </div>


         {/* Platform Features */}
         <div>
           <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Institutional Platform</h3>
           <div className="mt-3 h-px w-full bg-gradient-to-r from-[rgba(255,255,255,0.10)] to-transparent" />
           <div className="mt-4 space-y-2.5">
             {[
               { icon: Database, title: "Immutable Market Vault", desc: "Tamper-proof daily historical archives" },
               { icon: Zap, title: "Dual Session Updates", desc: "Automated at 9:00 AM & 5:30 PM IST" },
               { icon: Shield, title: "Institutional Precision", desc: "Verified IBJA, GoodReturns & Forex data" },
             ].map(({ icon: Icon, title, desc }) => (
               <div key={title} className="flex items-start gap-2.5 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-2.5">
                 <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00D4FF]" />
                 <div>
                   <p className="text-[11px] font-semibold text-white">{title}</p>
                   <p className="text-[10px] text-slate-500">{desc}</p>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>


       {/* Bottom Bar */}
       <div className="mt-12 border-t border-[rgba(255,255,255,0.05)] pt-6">
         <p className="text-[11px] leading-relaxed text-slate-600">
           <strong className="text-slate-500">Disclaimer:</strong> Spot rates and forex values on DailyVaultRates are for informational and historical archiving purposes only. They do not constitute financial advice or binding trading quotes. Always consult a certified financial advisor before executing commodity or currency transactions.
         </p>
         <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
           <p>© {new Date().getFullYear()} DailyVaultRates. All rights reserved.</p>
           <div className="flex items-center gap-2">
             <span className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-slate-400">
               Institutional Market Feed
             </span>
             <span className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-slate-400">
               Certified Rate Archives
             </span>
           </div>
         </div>
       </div>
     </div>
   </footer>
 );
}
