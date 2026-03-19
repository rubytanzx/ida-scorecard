import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default async function ViewWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkspaceShell mode="view" prebuilt={id === "mexico-fy25"} />;
}
