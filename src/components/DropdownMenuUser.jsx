import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DropdownMenuUser = (props) => {
  return (
    <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 bg-[#c8bdf7] rounded-full"
                >
                  <Avatar className="h-10 w-10  text-[#1f1b4a]">
                    <AvatarImage src={props.image || ""} alt={props.name || ""} />
                    <AvatarFallback>
                      {props.name ? props.name.charAt(0).toUpperCase() : "Uf"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {props.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {props.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="hover:bg-red-50"
                >
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
  );
};

export default DropdownMenuUser;