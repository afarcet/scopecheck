import { redirect } from 'next/navigation';

// Legacy route — redirects /[handle] → /i/[handle] for backward compatibility
export default async function LegacyHandleRedirect({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  redirect(`/i/${handle}`);
}
