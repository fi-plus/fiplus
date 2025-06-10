import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, History, Users, Settings } from "lucide-react";

const quickActions = [
  {
    icon: ArrowRightLeft,
    label: "Convert",
    color: "text-primary",
  },
  {
    icon: History,
    label: "History",
    color: "text-primary",
  },
  {
    icon: Users,
    label: "Contacts",
    color: "text-primary",
  },
  {
    icon: Settings,
    label: "Settings",
    color: "text-primary",
  },
];

export default function QuickActions() {
  return (
    <Card className="bg-white card-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.label}
                variant="ghost"
                className="flex flex-col items-center p-4 h-auto bg-gray-50 hover:bg-gray-100 border-0"
              >
                <IconComponent className={`w-6 h-6 mb-2 ${action.color}`} />
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
