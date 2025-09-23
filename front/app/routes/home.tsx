import { getToken, setToken } from "~/utils/token";
import type { Route } from "./+types/home";
import fpPromise from "@fingerprintjs/fingerprintjs"
import { useEffect, useRef, useState } from "react";
import { registerRequire } from "~/api/register";
import type { RolesRequireType } from "~/api/role.type";
import { rolesRequire } from "~/api/role";

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

const useRoleModals = () => {
	const [roles, setRoles] = useState<RolesRequireType[]>()
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		setLoading(true)
		// 获取角色
		rolesRequire().then(res => {
			if (res?.code === 200) {
				console.log(res.data);

				setRoles(res.data)
			}
		}).finally(() => {
			setLoading(false)
		})
	}, [])

	return { roles, loading }
}

export default function Home() {

	const aiRoleModal = useRef<HTMLDialogElement | null>(null)
	const { roles, loading } = useRoleModals()

	useEffect(() => {
		initialLogin()
	}, [])

	return <>
		<div className="navbar bg-base-100 shadow-sm">
			<div className="flex-1">
				<a className="btn btn-ghost text-xl">AI聊天</a>
			</div>
			<div className="flex-none">
				<ul className="menu menu-horizontal px-1">
					<li onClick={() => aiRoleModal.current?.showModal()}><a>AI角色</a></li>
				</ul>
			</div>
		</div>

		<dialog id="ai_role_modal" className="modal" ref={aiRoleModal}>
			<div className="modal-box w-full h-full">
				<form method="dialog">
					<button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
				</form>
				<h3 className="font-bold text-lg">AI角色</h3>

				{loading ? <div className="w-full flex justify-center">
					<span className="loading loading-infinity text-primary w-32"></span>
				</div> : roles ? <div className="grid grid-cols-2 gap-4 mt-4">{roles.map(role => {
					return <div className="card bg-base-100 w-full shadow-sm" key={role.id}>
						<figure>
							<div className="w-full h-[163px] overflow-hidden">
								<img
									src={role.img}
									alt={role.name} className="w-full" />
							</div>
						</figure>
						<div className="card-body">
							<h2 className="card-title justify-center">{role.name}</h2>
							<div className="card-actions justify-center">
								<button className="btn btn-primary">创建</button>
							</div>
						</div>
					</div>
				})} </div> : <div>暂无角色</div>}

			</div>

		</dialog>
	</>;
}
