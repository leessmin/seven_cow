import { getToken, setToken } from "~/utils/token";
import type { Route } from "./+types/home";
import fpPromise from "@fingerprintjs/fingerprintjs"
import { useEffect } from "react";
import { registerRequire } from "~/api/register";

export function meta({ }: Route.MetaArgs) {
	return [
		{ title: "Ai" },
		{ name: "description", content: "7牛云校招项目" },
	];
}

// 初始化登陆
const initialLogin = () => {
	const token = getToken()
	if (token.length === 0) {
		// 注册
		fpPromise.load()
			.then(fp => fp.get())
			.then(async result => {
				const formData = new FormData()
				formData.append("fingerprint", result.visitorId)
				const res = await registerRequire(formData)
				if (res?.code === 200) {
					setToken(res.data.id.toString())
				}
			})
	}
}

export default function Home() {

	useEffect(() => {
		initialLogin()
	}, [])

	return <>
		<h1>hhhh</h1>
	</>;
}
