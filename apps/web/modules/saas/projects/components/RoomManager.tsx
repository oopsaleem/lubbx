"use client";

import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Input } from "@ui/components/input";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Room = {
	id: string;
	name: string;
	sortOrder: number;
};

type Props = {
	rooms: Room[];
	onAdd: (name: string) => Promise<void>;
	onRemove: (roomId: string) => Promise<void>;
	onReorder: (roomIds: string[]) => Promise<void>;
	isLoading?: boolean;
};

export function RoomManager({
	rooms,
	onAdd,
	onRemove,
	onReorder,
	isLoading,
}: Props) {
	const t = useTranslations();
	const [newRoomName, setNewRoomName] = useState("");
	const [adding, setAdding] = useState(false);

	const handleAdd = async () => {
		if (!newRoomName.trim()) return;
		setAdding(true);
		await onAdd(newRoomName.trim());
		setNewRoomName("");
		setAdding(false);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-sm">
					{t("projects.rooms.title")}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2">
					<Input
						value={newRoomName}
						onChange={(e) => setNewRoomName(e.target.value)}
						placeholder={t("projects.rooms.addPlaceholder")}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleAdd();
						}}
					/>
					<Button
						variant="outline"
						onClick={handleAdd}
						loading={adding}
						disabled={!newRoomName.trim()}
					>
						{t("projects.rooms.add")}
					</Button>
				</div>

				{rooms.length === 0 && (
					<p className="py-4 text-center text-sm opacity-50">
						{t("projects.rooms.empty")}
					</p>
				)}

				<ul className="space-y-2">
					{rooms
						.sort((a, b) => a.sortOrder - b.sortOrder)
						.map((room) => (
							<li
								key={room.id}
								className="flex items-center justify-between rounded-md border px-3 py-2"
							>
								<span className="text-sm">{room.name}</span>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onRemove(room.id)}
								>
									✕
								</Button>
							</li>
						))}
				</ul>
			</CardContent>
		</Card>
	);
}
