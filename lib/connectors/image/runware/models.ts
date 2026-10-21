export const RUNWARE_IMAGE_MODELS = {
	"Muse Image": {
		id: "meta:muse@image",
		cost: "low",
		speed: "high",
		frames: [
			{ width: 2048, height: 1152 },
			{ width: 1152, height: 2048 },
		],
	},
	"Seedream 5 Lite": {
		id: "bytedance:seedream@5.0-lite",
		cost: "low",
		speed: "high",
	},
} as const;
