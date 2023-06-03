import { notFound } from "next/navigation";
import { initRedis } from "@devographics/redis";
import { serverConfig } from "~/config/server";
import { SurveySectionOutline } from "~/components/questions/SurveySectionOutline";

// SectionNumber is optional in the URL so this page is exactly the same as ../index.tsx
export default async function SurveySectionOutlinePage({
  params: { sectionNumber },
}: {
  params: {
    slug: string;
    year: string;
    responseId: string;
    sectionNumber: string;
  };
}) {
  initRedis(serverConfig().redisUrl);
  const sn = parseInt(sectionNumber);
  if (isNaN(sn)) notFound();
  return <SurveySectionOutline />;
}
