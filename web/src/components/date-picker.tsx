import { SidebarGroup, SidebarGroupContent, } from "@/components/ui/sidebar";
import { Calendar } from "@/components/ui/calendar";


export function DatePicker() {
	return (
		<SidebarGroup className="px-0">
			<SidebarGroupContent>
				<Calendar className="[&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px]" />
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
