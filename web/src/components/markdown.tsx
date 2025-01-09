import type { ComponentProps, DetailedHTMLProps, HTMLAttributes } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import config from '@web-config.json';
import remarkGfm from 'remark-gfm';


function Markdown({ children, ...props }: ComponentProps<typeof ReactMarkdown>) {
	// Custom paragraph component that handles @ mentions and keyword highlights
	const P = ({ children, ...props }: DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>) => {
		if (typeof children !== 'string') {
			return <p {...props}>{children}</p>;
		}

		// Split text into segments based on @ mentions
		const segments = children.split(/((?:@[\w._-]+)|(?:<[@#&]!?\d{17,19}>))/g);

		const rendered = segments.map((segment, index) => {
			// Check if it's a Discord mention format
			const discordMentionMatch = segment.match(/<((?::\w+:|@!*&*|#))([0-9]+)>/);

			if (discordMentionMatch) {
				const symbol = discordMentionMatch[1];
				const mention = discordMentionMatch[2];
				return (
					<span
						key={index}
						className='inline-block bg-blue-300/10 text-blue-300 hover:bg-blue-300/50g rounded px-1 font-medium'
					>
						{symbol} {mention?.replace(/^[@#&]!?/, '')}
					</span>
				);
			}

			// Check if segment is an @ mention
			if (segment.match(/^@[\w._-]+$/)) {
				return (
					<span
						key={index}
						className='inline-block bg-blue-300/20 text-blue-300 hover:bg-blue-300/60 transition-colors rounded px-1 font-medium'
					>
						{segment}
					</span>
				);
			}

			// Highlight keywords
			let highlighted = false;
			const highlightedSegment = Object.entries(config.highlightedKeywords).reduce((acc, [regex, color]) => {
				const regexPattern = new RegExp(regex, 'gi');
				const matches = segment.match(regexPattern);

				if (matches) {
					highlighted = true;
					return acc.replace(regexPattern, (match) => `<span class='font-bold' style="color: ${color};">${match}</span>`);
				}

				return acc;
			}, segment);

			// If the segment contains a highlighted keyword, wrap it with the appropriate span
			if (highlighted) {
				return (
					<span
						key={index}
						className='inline-block'
						dangerouslySetInnerHTML={{ __html: highlightedSegment }}
					/>
				);
			}

			// Default case
			return <span key={index}>{segment}</span>;
		});

		return <p {...props}>{rendered}</p>;
	};

	const renderers: Components = { p: P };

	return (
		<ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers} {...props}>
			{children}
		</ReactMarkdown>
	);
}

export default Markdown;
