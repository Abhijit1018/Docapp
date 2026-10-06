import type { Metadata } from "next";
import { ClinicProvider } from "@/components/ClinicProvider";
import { Pitch } from "@/components/pitch/Pitch";
import { pageContext, type PageProps } from "@/lib/server";

export const metadata: Metadata = { title: "Serenity pitch" };

export default async function Page(props: PageProps) {
  const { params, lang } = await pageContext(props);
  return (
    <ClinicProvider params={params} lang={lang}>
      <Pitch />
    </ClinicProvider>
  );
}
