import { GameState } from "../engine/GameState";
import type { CommentaryEntry } from "../types";

export function CommentaryFeed() {
	const items = GameState.commentary.value;

	return (
		<main className="flex-grow p-4 space-y-3 overflow-y-auto no-scrollbar mask-gradient">
			{items.map((item) => (
				<CommentaryItem key={item.id} item={item} />
			))}
		</main>
	);
}

interface CommentaryItemProps {
	item: CommentaryEntry;
}

function CommentaryItem({ item }: CommentaryItemProps) {
	// Style based on type
	let className = "p-3 border-l-4 text-sm font-medium animate-fade-in ";

	switch (item.type) {
		case "wicket":
			className += "bg-red-900/20 border-red-500 text-red-400";
			break;
		case "four":
		case "six":
			className += "bg-emerald-900/20 border-emerald-500 text-emerald-400";
			break;
		case "milestone":
			className +=
				"bg-purple-900/20 border-purple-500 text-purple-400 font-bold italic";
			break;
		case "maiden":
			className +=
				"bg-emerald-900/20 border-emerald-500 text-emerald-400 font-bold italic";
			break;
		case "intro":
			className += "bg-gray-800 border-gray-600 text-gray-400 italic";
			break;
		default:
			className += "border-gray-800 text-gray-300";
	}

	return (
		<div className={className}>
			{item.over && item.type !== "intro" && (
				<span className="text-gray-500 mono mr-2 text-xs opacity-70">
					{item.over}
				</span>
			)}
			{item.text}
		</div>
	);
}
