import Header from '~/components/header';


function Page(props: React.PropsWithChildren) {
	return <>
		<Header />
		<div className='flex flex-col w-full h-full p-4 flex-1'>
			{props.children}
		</div>
	</>;
}

export default Page;