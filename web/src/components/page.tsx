import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarLeft } from '@/components/sidebar-left';


function Page(props: React.PropsWithChildren) {
	return <SidebarProvider>
		<SidebarLeft />
		<div className='flex flex-col w-full p-2'>
			{props.children}
		</div>
	</SidebarProvider>;
}

export default Page;