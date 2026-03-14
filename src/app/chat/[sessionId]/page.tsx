export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <div>
      <h1>Session: {sessionId}</h1>
    </div>
  );
}
