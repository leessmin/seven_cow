import { getToken } from '~/utils/token'
import MyFetch from '~/utils/myFetch'
import type { Response } from './api.type'
import toast from 'react-hot-toast'

// 超时时间 一个小时
const apiFetch = new MyFetch("/api", 1000 * 60 * 60)

apiFetch.addInterceptorsReq((url: string, method: RequestInit) => {
	method.headers = {
		...method.headers,
		"Authorization": `Bearer ${getToken()}`
	}

	return { url, method, abort: false }
})

apiFetch.addInterceptorsRes(<T>(result: T) => {
	let res = result as Response<any>
	if (res.code != 200) {
		toast.error(res.msg)
	}

	return { result, abort: false }
})

export default apiFetch