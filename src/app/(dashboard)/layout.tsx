import { Suspense } from "react"
import Loading from "../loading";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import { AuthGuard } from "@/src/components/layout/AuthGuard";

export default function DashboardRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<Loading />}>
            <AuthGuard>
                <DashboardLayout>{children}</DashboardLayout>
            </AuthGuard>
        </Suspense>
    );
} 