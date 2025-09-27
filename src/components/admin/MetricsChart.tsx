"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/components/ui/card";

export default function MetricsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full"></div>
      </CardContent>
    </Card>
  );
}
