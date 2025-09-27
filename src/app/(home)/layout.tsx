import { Suspense } from "react"
import Loading from "../loading";
import Layout from "@/src/components/layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>{children}</Layout>
    </Suspense>
  );
}
