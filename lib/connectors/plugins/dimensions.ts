import type { ConnectorPlugin, ModelRef } from "@/lib/connectors/types";
import { modelEntry } from "../models";
import {
	ASPECT_RATIO_DIMENSIONS,
	AspectRatioSchema,
	type MediaResolution,
} from "@/lib/project/aspect-ratio";

type Dimensioned = ModelRef & {
	prompt: string;
	width?: number;
	height?: number;
	resolution?: MediaResolution;
};

const ASPECT_RATIO = "the aspect ratio";

/** Sizes a generation from the project's aspect ratio and the resolution its model renders at. */
export function createDimensionsPlugin(
	kind: "image" | "video",
): ConnectorPlugin<Dimensioned> {
	return {
		name: "dimensions",
		reads: [
			(_, { state }) => ({ [ASPECT_RATIO]: state.videoSettings.aspectRatio }),
		],
		beforeGenerate(params, ctx) {
			const { sizes } =
				ASPECT_RATIO_DIMENSIONS[
					AspectRatioSchema.parse(ctx.reads?.[ASPECT_RATIO])
				];
			const { resolutions } = modelEntry(kind, params);
			const resolution = params.resolution ?? resolutions[0];
			if (!resolutions.includes(resolution))
				throw new Error(`${params.model} cannot render ${resolution}`);
			return { ...params, resolution, ...sizes[resolution] };
		},
	};
}
