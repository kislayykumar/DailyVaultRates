import { getLatestRates, getPreviousDayRates, getAllAvailableDates, getHistoricalDataHistory } from "@/lib/dataFetcher";
import DashboardView from "@/components/DashboardView";
import { Vault, AlertTriangle } from "lucide-react";


// Revalidate every 60 seconds so Vercel picks up the new JSON
export const revalidate = 60;


export default async function HomePage() {
 const latestResult = await getLatestRates();
 const allAvailableDates = await getAllAvailableDates();
 const historicalHistory = await getHistoricalDataHistory();


 if (!latestResult) {
   return (
     <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
       <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
         <Vault className="h-8 w-8" />
       </div>
       <h1 className="text-2xl font-bold text-white">No Spot Data Available</h1>
       <p className="mt-2 text-sm text-slate-400 max-w-md">
         The data pipeline is initializing. Run{" "}
         <code className="text-amber-300 font-mono">npm run fetch-rates</code> to generate
         today&apos;s spot rate file.
       </p>
     </div>
   );
 }


 const { data: currentData } = latestResult;
 const previousData = await getPreviousDayRates(currentData.date);


 // Check if the data we're showing is stale (older than 26 hours)
 const dataAgeMs = Date.now() - currentData.timestamp;
 const dataAgeHours = dataAgeMs / (1000 * 60 * 60);
 const isStale = dataAgeHours > 26;


 return (
   <>
     {/* Stale data banner — shown when GitHub Action hasn't run today */}
     {isStale && (
       <div className="flex items-center gap-3 border-b border-[rgba(240,180,41,0.18)] bg-[rgba(240,180,41,0.07)] px-4 py-2.5 text-sm text-[#F0B429]">
         <AlertTriangle className="h-4 w-4 shrink-0" />
         <span className="text-[11px]">
           <strong>Rates may be outdated.</strong> Showing data from{" "}
           {currentData.date} — the daily update pipeline may have been delayed.
           Prices refresh automatically every morning at 9:00 AM IST.
         </span>
       </div>
     )}
     <DashboardView
       currentData={currentData}
       previousData={previousData}
       allAvailableDates={allAvailableDates}
       historicalHistory={historicalHistory}
       title="Live Spot Rates & Daily Market Vault"
     />
   </>
 );
}
