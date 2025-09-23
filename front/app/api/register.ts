import apiFetch from "./api";
import type { RegisterRequireType } from "./register.type";

export const registerRequire = (data: FormData) => {
	return apiFetch.Require<RegisterRequireType>("/user/register", {
		method: "POST",
		body: data
	})
}