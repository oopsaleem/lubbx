"use client";

import { Button } from "@ui/components/button";
import { useTranslations } from "next-intl";

type Room = {
	id: string;
	name: string;
	sortOrder: number;
};

type Props = {
	rooms: Room[];
	activeRoomId: string | null;
	onSelectRoom: (roomId: string | null) => void;
};

export function RoomSidebar({ rooms, activeRoomId, onSelectRoom }: Props) {
	const t = useTranslations();

	return (
		<div className="space-y-2">
			<h3 className="text-sm font-medium">{t("projects.rooms.title")}</h3>
			<Button
				variant={activeRoomId === null ? "default" : "ghost"}
				size="sm"
				className="w-full justify-start"
				onClick={() => onSelectRoom(null)}
			>
				{t("projects.media.allFiles")}
			</Button>
			{rooms
				.sort((a, b) => a.sortOrder - b.sortOrder)
				.map((room) => (
					<Button
						key={room.id}
						variant={activeRoomId === room.id ? "default" : "ghost"}
						size="sm"
						className="w-full justify-start"
						onClick={() => onSelectRoom(room.id)}
					>
						{room.name}
					</Button>
				))}
		</div>
	);
}
