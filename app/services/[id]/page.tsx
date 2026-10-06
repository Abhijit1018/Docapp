import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClinicProvider } from "@/components/ClinicProvider";
import { ServiceDetailPage } from "@/components/public/Pages";
import { SiteShell } from "@/components/public/SiteShell";
import { buildClinic } from "@/lib/clinic";
import { nextOpenSlots, seedState } from "@/lib/data/core";
import { pageContext, type PageProps } from "@/lib/server";

type Props = PageProps & { params: Promise<{ id: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const clinic = buildClinic((await pageContext(props)).params);
  const id = decodeURIComponent((await props.params).id);
  const service = clinic.services.find((s) => s.id === id);
  return { title: `${service?.name.en ?? "Service"} | ${clinic.name}` };
}

export default async function Page(props: Props) {
  const { params, lang, now } = await pageContext(props);
  const id = decodeURIComponent((await props.params).id);
  const clinic = buildClinic(params);
  if (!clinic.services.some((s) => s.id === id)) notFound();
  const initialSlots = nextOpenSlots(seedState(clinic, now), clinic, now, 5);
  return (
    <ClinicProvider params={params} lang={lang}>
      <SiteShell serverNow={now}>
        <ServiceDetailPage id={id} initialSlots={initialSlots} serverNow={now} />
      </SiteShell>
    </ClinicProvider>
  );
}
