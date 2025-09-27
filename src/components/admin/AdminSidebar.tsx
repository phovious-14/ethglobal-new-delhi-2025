import Link from "next/link";
import {
  Users,
  BarChart2,
  Settings,
  Shield,
  LineChart,
  DollarSign,
} from "lucide-react";

const navigation = [
  {
    title: "User Management",
    items: [
      {
        title: "Verification Queue",
        href: "/admin/users/verification",
        icon: Shield,
      },
      { title: "Disputes", href: "/admin/users/disputes", icon: Users },
      { title: "Moderation", href: "/admin/users/moderation", icon: Shield },
    ],
  },
  {
    title: "Analytics",
    items: [
      { title: "Dashboard", href: "/admin/analytics", icon: BarChart2 },
      { title: "Growth", href: "/admin/analytics/growth", icon: LineChart },
      { title: "Revenue", href: "/admin/analytics/revenue", icon: DollarSign },
    ],
  },
  {
    title: "Settings",
    items: [
      { title: "Fee Structure", href: "/admin/settings/fees", icon: Settings },
      { title: "Features", href: "/admin/settings/features", icon: Settings },
      {
        title: "Integrations",
        href: "/admin/settings/integrations",
        icon: Settings,
      },
    ],
  },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 border-r bg-background">
      <nav className="p-4 space-y-6">
        {navigation.map((group) => (
          <div key={group.title}>
            <h3 className="font-semibold mb-2">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent"
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
