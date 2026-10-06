import type { Metadata } from "next";
import { ClinicProvider } from "@/components/ClinicProvider";
import { DeskApp } from "@/components/desk/DeskApp";
import { pageContext, type PageProps } from "@/lib/server";

export const metadata: Metadata = { title: "Front desk" };

export default async function Page(props: PageProps) {
  const { params, lang, now, search } = await pageContext(props);
  return (
    <ClinicProvider params={params} lang={lang}>
      <DeskApp serverNow={now} pitch={search.pitch === "1"} />
    </ClinicProvider>
  );
}
