import Markdown from '~/components/markdown';
import type { Embed } from '@shared/types';
import moment from 'moment';
import React from 'react';


interface EmbedProps {
	embed: Embed;
}

const Embed: React.FC<EmbedProps> = ({ embed }) => {
	console.log(embed);
	return (
		<div
			className="flex flex-col gap-4 max-w-lg p-4 rounded-md shadow-lg bg-foreground/10"
			style={{ borderLeft: `6px solid ${embed.color ? '#' + embed.color.toString(16) : '#7289da'}` }}
		>
			{/* Author Section */}
			{embed.author && (
				<div className="flex items-center gap-2">
					{embed.author.icon_url && (
						<img
							src={embed.author.icon_url}
							alt={`${embed.author.name}'s icon`}
							className="w-10 h-10 rounded-full"
						/>
					)}
					<a
						href={embed.author.url || '#'}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm font-medium text-blue-400 hover:underline"
					>
						{embed.author.name}
					</a>
				</div>
			)}

			{/* Title */}
			{embed.title && (
				<h3 className="text-lg font-bold text-white">
					{embed.url ? (
						<a
							href={embed.url}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline"
						>
							{embed.title}
						</a>
					) : (
						embed.title
					)}
				</h3>
			)}

			{/* Description */}
			{embed.description && (
				<p className="text-sm text-gray-300">
					<span className='prose text-sm whitespace-pre'>
						<Markdown>{embed.description}</Markdown>
					</span>
				</p>
			)}

			{/* Fields */}
			{embed.fields && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
					{embed.fields.map((field, index) => (
						<div
							key={index}
							className={`p-2 bg-gray-700 rounded ${field.inline ? 'col-span-1' : 'col-span-full'
								}`}
						>
							<h4 className="text-xs font-semibold text-gray-400">
								{field.name}
							</h4>
							<p className="text-sm text-gray-200">{field.value}</p>
						</div>
					))}
				</div>
			)}

			{/* Image */}
			{embed.image && (
				<img
					src={embed.image.url}
					alt="Embed Image"
					className="rounded-lg max-w-full"
				/>
			)}

			{/* Thumbnail */}
			{embed.thumbnail && (
				<img
					src={embed.thumbnail.url}
					alt="Embed Thumbnail"
					className="w-20 h-20 rounded-lg float-right ml-4"
				/>
			)}

			{/* Footer */}
			{embed.footer && (
				<div className="flex items-center gap-2 border-t pt-2">
					{embed.footer.icon_url && (
						<img
							src={embed.footer.icon_url}
							alt="Footer Icon"
							className="w-6 h-6 rounded-full"
						/>
					)}
					<span className="text-xs text-foreground/75">{embed.footer.text}</span>
					{embed.timestamp && (
						<span className="text-xs text-foreground/50 ml-auto">
							{moment(embed.timestamp).toLocaleString()}
						</span>
					)}
				</div>
			)}
		</div>
	);
};

export default Embed;
