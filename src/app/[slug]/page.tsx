import LinkListHub from "@/components/LinkListHub";

/**
 * Next.js output: "export" 모드 대응을 위한 정적 파라미터 정의
 */
export function generateStaticParams() {
  return [
    { slug: "dayoung" },
    { slug: "jisoo-design" },
    { slug: "links" },
  ];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <LinkListHub slug={resolvedParams.slug} />;
}
