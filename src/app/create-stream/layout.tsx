
import { AuthGuard } from "@/src/components/layout/AuthGuard";

export default function CreateStreamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}
