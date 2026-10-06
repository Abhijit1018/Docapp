import type { Metadata } from "next";
import { ClinicProvider } from "@/components/ClinicProvider";
import { Home } from "@/components/public/Home";
import { SiteShell } from "@/components/public/SiteShell";
import { buildClinic } from "@/lib/clinic";
import { nextOpenSlots, seedState } from "@/lib/data/core";
import { pageContext, type PageProps } from "@/lib/server";

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const clinic = buildClinic((await pageContext(props)).params);
  return {
    title: `${clinic.name}, ${clinic.area}`,
    description: `Book a visit with ${clinic.doctor} at ${clinic.name}, ${clinic.area}, ${clinic.city}.`,
  };
}

export default async function Page(props: PageProps) {
  const { params, lang, now } = await pageContext(props);
  const clinic = buildClinic(params);
  // The browser starts from this same seed, so the next free slot is already
  // in the HTML and does not wait for JavaScript.
  const initialSlots = nextOpenSlots(seedState(clinic, now), clinic, now, 5);
  return (
    <ClinicProvider params={params} lang={lang}>
      <SiteShell serverNow={now}>
        <Home initialSlots={initialSlots} serverNow={now} />
      </SiteShell>
    </ClinicProvider>
  );
}
