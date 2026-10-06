import type { Metadata } from "next";
import { ClinicProvider } from "@/components/ClinicProvider";
import { ContactPage } from "@/components/public/Pages";
import { SiteShell } from "@/components/public/SiteShell";
import { buildClinic } from "@/lib/clinic";
import { pageContext, type PageProps } from "@/lib/server";

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const clinic = buildClinic((await pageContext(props)).params);
  return { title: `Contact and directions | ${clinic.name}` };
}

export default async function Page(props: PageProps) {
  const { params, lang, now } = await pageContext(props);
  return (
    <ClinicProvider params={params} lang={lang}>
      <SiteShell serverNow={now}>
        <ContactPage serverNow={now} />
      </SiteShell>
    </ClinicProvider>
  );
}
