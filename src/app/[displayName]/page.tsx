import LinkListHub from "@/components/LinkListHub";

/**
 * Next.js output: "export" 모드 대응을 위한 정적 파라미터 정의
 */
export function generateStaticParams() {
  return [
    { displayName: "dayoung" },
    { displayName: "links" },
  ];
}

interface PageProps {
  params: Promise<{ displayName: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return (
    <LinkListHub
      displayName={resolvedParams.displayName}
      slug={resolvedParams.displayName}
    />
  );
}
