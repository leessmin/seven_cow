import apiFetch from "./api";
import type { Response } from "./api.type";
import type { SendAudioRequireType } from "./audio.type";

// 发送音频
export function sendAudioRequire(body: FormData) {
	return apiFetch.Require<Response<SendAudioRequireType>>("/audio/send", {
		method: "POST",
		body
	})
}