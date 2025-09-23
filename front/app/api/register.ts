import apiFetch from "./api";
import type { RegisterRequireType } from "./register.type";
import type { Response } from "./api.type";

export const registerRequire = (data: FormData) => {
	return apiFetch.Require<Response<RegisterRequireType>>("/user/register", {
		method: "POST",
		body: data
	})
}