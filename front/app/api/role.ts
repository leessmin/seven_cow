import apiFetch from "./api"
import type { RolesRequireType } from "./role.type"
import type { Response } from "./api.type";

export const rolesRequire = () => {
	return apiFetch.Require<Response<RolesRequireType[]>>("/role/get_roles")
}