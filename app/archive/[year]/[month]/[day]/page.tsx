import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getRatesByDate,
  getPreviousDayRates,
  getAllAvailableDates,
} from "@/lib/dataFetcher";
import DashboardView from "@/components/DashboardView";

interface ArchivePageProps {
  params: {
    year: string;
    month: string;
    day: string;
  };
}

export async function generateStaticParams() {
  const dates = await getAllAvailableDates();
  return dates.map((d) => ({
    year: d.year,
    month: d.month.padStart(2, "0"),
    day: d.day.padStart(2, "0"),
  }));
}

export async function generateMetadata({ params }: ArchivePageProps): Promise<Metadata> {
  const formattedMonth = params.month.padStart(2, "0");
  const formattedDay = params.day.padStart(2, "0");
  const dateStr = `${params.year}-${formattedMonth}-${formattedDay}`;

  const data = await getRatesByDate(params.year, formattedMonth, formattedDay);

  if (!data) {
    return {
      title: `Spot Rate Archive Not Found (${dateStr}) | DailyVaultRates`,
    };
  }

  const gold = data.metals.find((m) => m.id === "gold");
  const silver = data.metals.find((m) => m.id === "silver");

  return {
    title: `Gold, Silver & FX Rates for ${dateStr} | DailyVaultRates`,
    description: `Official historical spot metal and forex rates for ${dateStr}. Gold: $${gold?.priceUsdOunce || 'N/A'}/oz, Silver: $${silver?.priceUsdOunce || 'N/A'}/oz. Immutable Git-as-a-Database archive records.`,
    keywords: [
      `daily gold rates ${dateStr}`,
      `historical silver prices ${dateStr}`,
      `spot metal archive ${params.year}`,
      `daily forex rates ${dateStr}`,
      "precious metals archive",
      "historical exchange rates",
    ],
    openGraph: {
      title: `Gold, Silver & FX Rates for ${dateStr} | DailyVaultRates`,
      description: `Historical spot rate archive for ${dateStr}. Complete precious metals and foreign exchange metrics.`,
      url: `https://dailyvaultrates.com/archive/${params.year}/${formattedMonth}/${formattedDay}`,
      siteName: "DailyVaultRates",
      type: "article",
    },
  };
}

export default async function ArchivePage({ params }: ArchivePageProps) {
  const formattedMonth = params.month.padStart(2, "0");
  const formattedDay = params.day.padStart(2, "0");
  const dateStr = `${params.year}-${formattedMonth}-${formattedDay}`;

  const currentData = await getRatesByDate(params.year, formattedMonth, formattedDay);

  if (!currentData) {
    notFound();
  }

  const previousData = await getPreviousDayRates(dateStr);
  const allAvailableDates = await getAllAvailableDates();

  return (
    <DashboardView
      currentData={currentData}
      previousData={previousData}
      allAvailableDates={allAvailableDates}
      title={`Historical Spot Rates for ${dateStr}`}
      isArchivePage={true}
    />
  );
}
