import { getToken } from '~/utils/token'
import MyFetch from '~/utils/myFetch'

const apiFetch = new MyFetch("/api", 2000)

apiFetch.addInterceptorsReq((url: string, method: RequestInit) => {
	method.headers = {
		...method.headers,
		"Authorization": `Bearer ${getToken()}`
	}

	return { url, method, abort: false }
})

export default apiFetch