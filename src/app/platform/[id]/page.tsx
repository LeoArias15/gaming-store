import { notFound } from "next/navigation";
import Experience from "../../console-experience";
import PspExperience from "../../psp-experience";
import WiiExperience from "../../wii-experience";
import platforms from "../../../data/consoles.json";
export function generateStaticParams() {
  return platforms.map((p) => ({ id: p.id }));
}
export default async function Platform({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!platforms.some((p) => p.id === id)) notFound();
  if (id === "psp") return <PspExperience />;
  if (id === "wii") return <WiiExperience />;
  return <Experience platformId={id} />;
}
