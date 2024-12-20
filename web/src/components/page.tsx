import Header from '~/components/header';
import { cn } from '~/utils';
import React from 'react';


interface PageProps extends React.ComponentProps<'div'> {
	containerClassName?: string;
}

function Page({ children, ...props }: PageProps) {
	return <div {...props}>
		<Header />
		<div className={cn('flex flex-col w-full h-full p-4 flex-1', props.containerClassName)}>
			{children}
		</div>
	</div>;
}

export default Page;