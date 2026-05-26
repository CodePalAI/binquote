import { notFound } from "next/navigation";
import { getOperator } from "@/lib/db";
import { EmbedFrame } from "@/components/EmbedFrame";

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rules = getOperator(slug);
  if (!rules) notFound();
  return <EmbedFrame rules={rules} />;
}
