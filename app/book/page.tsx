import type { Metadata } from "next";
import { ClinicProvider } from "@/components/ClinicProvider";
import { BookFlow } from "@/components/public/BookFlow";
import { pageContext, type PageProps } from "@/lib/server";

export const metadata: Metadata = { title: "Book a visit" };

export default async function Page(props: PageProps) {
  const { params, lang, now, search } = await pageContext(props);
  const slot = typeof search.slot === "string" ? search.slot : undefined;
  return (
    <ClinicProvider params={params} lang={lang}>
      <BookFlow slot={slot} service={typeof search.service === "string" ? search.service : undefined}
        day={typeof search.day === "string" ? search.day : undefined} serverNow={now} />
    </ClinicProvider>
  );
}
