import {
	closestCorners,
	pointerWithin,
	type CollisionDetection,
} from "@dnd-kit/core";

export const canvasCollisionDetection: CollisionDetection = (args) =>
	args.pointerCoordinates ? pointerWithin(args) : closestCorners(args);
