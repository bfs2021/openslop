import isEqual from "lodash/isEqual";
import type { ConnectorPlugin, ModelRef } from "@/lib/connectors/types";
import { modelEntry } from "../models";
import {
	ASPECT_RATIO_DIMENSIONS,
	AspectRatioSchema,
	type Dimensions,
	type VideoResolution,
} from "@/lib/project/aspect-ratio";

type Dimensioned = ModelRef & {
	prompt: string;
	width?: number;
	height?: number;
	resolution?: VideoResolution;
};

const ASPECT_RATIO = "the aspect ratio";

function imageSize(ref: ModelRef, size: Dimensions): Dimensions {
	const { frames } = modelEntry("image", ref);
	if (frames && !frames.some((frame) => isEqual(frame, size)))
		throw new Error(`${ref.model} cannot render ${size.width}x${size.height}`);
	return size;
}

/** Sizes a generation from the project's aspect ratio, and a video from its resolution too. */
export function createDimensionsPlugin(
	kind: "image" | "video",
): ConnectorPlugin<Dimensioned> {
	return {
		name: "dimensions",
		reads: [
			(_, { state }) => ({ [ASPECT_RATIO]: state.videoSettings.aspectRatio }),
		],
		beforeGenerate(params, ctx) {
			const dims =
				ASPECT_RATIO_DIMENSIONS[
					AspectRatioSchema.parse(ctx.reads?.[ASPECT_RATIO])
				];
			if (kind === "image")
				return { ...params, ...imageSize(params, dims.image) };
			const resolution =
				params.resolution ?? modelEntry("video", params).resolutions[0];
			return { ...params, resolution, ...dims.video[resolution] };
		},
	};
}
