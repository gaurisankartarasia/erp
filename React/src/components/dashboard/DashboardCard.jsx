
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const DashboardCard = ({ title, value, icon: Icon, link }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="bg-blue-500 text-white cursor-pointer hover:bg-blue-800 transition"
      onClick={() => link && navigate(link)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};
