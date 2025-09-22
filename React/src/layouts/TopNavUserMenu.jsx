import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { CircleUser, LogOut, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
  const { user } = useAuth();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-9 w-9 shadow cursor-pointer">
          <AvatarImage
            src={user.picture ? `${apiBaseUrl}/uploads/employees/${user.picture}` : undefined}
          />
          <AvatarFallback>
            <CircleUser className="h-5 w-5 text-black" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <div className="flex justify-between items-center px-2 py-2">
          <div>
            <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs opacity-80">{user.email}</p>
          </div>
          {user.is_master && (
            <Badge className="mt-1 w-fit bg-cyan-600 text-white shadow-sm">
              Master
            </Badge>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to="/account" className="flex items-center gap-2">
            <CircleUser className="h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to="/logout" className="flex items-center gap-2 text-red-600">
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
