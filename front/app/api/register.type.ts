import type { Response } from "./api.type";

export type RegisterRequireType = Response<{
	id: number,
	fingerprint: string,
	createdTime: string,
}>