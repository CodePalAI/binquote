import { notFound } from "next/navigation";
import { ensureInit } from "@/lib/db";
import { EmbedFrame } from "@/components/EmbedFrame";
import { ensureDemoOperator, DEMO_SLUG } from "@/lib/demo-seed";

export const dynamic = "force-dynamic";

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await ensureInit();
  if (slug === DEMO_SLUG) await ensureDemoOperator();
  const op = await store.getOperatorBySlug(slug);
  if (!op) notFound();
  return <EmbedFrame rules={op.rules} />;
}
