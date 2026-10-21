import { describe, expect, it, vi } from "vitest";
import { modelEntry } from "@/lib/connectors/models";
import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import { createCanvasElement } from "@/lib/canvas/create-canvas-element";
import { projectState } from "@/lib/generation/__tests__/_context";
import { pluginCtx, readsOf } from "./_state-ctx";

vi.mock("@/lib/connectors/models", async (importOriginal) => {
	const models =
		await importOriginal<typeof import("@/lib/connectors/models")>();
	return { ...models, modelEntry: vi.fn(models.modelEntry) };
});

const SEEDANCE = { provider: "runware", model: "Seedance 2 Fast" } as const;
const SLOP_IMAGE = { provider: "openslop", model: "Slop Image v2" } as const;
const image = createCanvasElement("image", { id: "i1" });
const portraitState = projectState({ aspectRatio: "9:16" });
const portrait = pluginCtx({
	reads: readsOf(createDimensionsPlugin("image"), image, [], portraitState),
});

describe("createDimensionsPlugin", () => {
	it.each([
		[
			"an image from the aspect ratio alone",
			"image",
			{ ...SLOP_IMAGE, resolution: "1080p" },
			{ resolution: "1080p", width: 1152, height: 2048 },
		],
		[
			"a video at the resolution it names",
			"video",
			{ resolution: "1080p" },
			{ resolution: "1080p", width: 1080, height: 1920 },
		],
		[
			"a video that names none at its model's default",
			"video",
			{},
			{ resolution: "720p", width: 720, height: 1280 },
		],
		[
			"a 1080p-only video that names none at 1080p",
			"video",
			{ model: "Kling 3 Omni Pro" },
			{ resolution: "1080p", width: 1080, height: 1920 },
		],
	] as const)("sizes %s", (_, type, named, size) => {
		const { beforeGenerate } = createDimensionsPlugin(type);
		const params = { ...SEEDANCE, prompt: "a cat", ...named };
		expect(beforeGenerate?.(params, portrait)).toEqual({ ...params, ...size });
	});

	it("fails on a size the image model cannot render", () => {
		vi.mocked(modelEntry).mockReturnValueOnce({
			...modelEntry("image", SLOP_IMAGE),
			frames: [{ width: 1600, height: 1600 }],
		});
		const { beforeGenerate } = createDimensionsPlugin("image");

		expect(() =>
			beforeGenerate?.({ ...SLOP_IMAGE, prompt: "a cat" }, portrait),
		).toThrow("Slop Image v2 cannot render 1152x2048");
	});

	it("records the aspect ratio, so changing it stales the result", () => {
		expect(
			readsOf(createDimensionsPlugin("image"), image, [], portraitState),
		).toEqual({ "the aspect ratio": "9:16" });
	});
});
