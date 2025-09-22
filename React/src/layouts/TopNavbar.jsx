
import useAuth from "@/hooks/useAuth";
import { formatDateTime } from "@/utils/date-format";
import { UserNav } from "./TopNavUserMenu";

export function TopNavbar() {
  const { user } = useAuth();

  return (
    <header className="bg-sidebar shadow-lg relative">
      <div className="w-full mx-auto px-4 h-14 lg:h-[60px] flex items-center justify-end gap-4 text-white">
        
        <div className="text-sm text-black">
          Last login: {formatDateTime(user.last_login)}{" "}
        </div>
<UserNav/>
     
      </div>
    </header>
  );
}
