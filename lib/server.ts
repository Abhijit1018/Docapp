import { cookies } from "next/headers";
import { pickParams, type ClinicParams, type Lang } from "./clinic";
import { asLang, LANG_COOKIE } from "./i18n";

export type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** What every page needs before it renders: the pitch's clinic, the remembered language and the clock. */
export async function pageContext(props: PageProps): Promise<{
  params: ClinicParams;
  lang: Lang;
  now: number;
  search: Record<string, string | string[] | undefined>;
}> {
  const search = await props.searchParams;
  const lang = asLang((await cookies()).get(LANG_COOKIE)?.value);
  return { params: pickParams(search), lang, now: Date.now(), search };
}
