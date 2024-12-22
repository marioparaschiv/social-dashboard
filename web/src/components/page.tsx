import Header from '~/components/header';
import { cn } from '~/utils';
import React from 'react';


interface PageProps extends React.ComponentProps<'div'> {
	containerClassName?: string;
}

function Page({ children, containerClassName, ...props }: PageProps) {
	return <div {...props}>
		<Header />
		<div className={cn('flex flex-col p-4 w-full h-full', containerClassName)}>
			{children}
		</div>
	</div>;
}

export default Page;