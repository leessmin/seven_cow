import { getToken, setToken } from "~/utils/token";
import type { Route } from "./+types/home";
import fpPromise from "@fingerprintjs/fingerprintjs"
import { useCallback, useEffect, useRef, useState } from "react";
import { registerRequire } from "~/api/register";
import type { RolesRequireType } from "~/api/role.type";
import { rolesRequire } from "~/api/role";
import { chatCreateRequire, chatListRequire } from "~/api/chat";
import toast from "react-hot-toast";
import type { ChatListRequireType } from "~/api/chat.type";
import dayjs from "dayjs";
import LoadingBox from "~/components/LoadingBox";

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
				setRoles(res.data)
			}
		}).finally(() => {
			setLoading(false)
		})
	}, [])

	return { roles, loading }
}

function CreateChatDialog({ ref, roleId, createDone }: { ref: React.RefObject<HTMLDialogElement | null>, roleId: number, createDone: () => void }) {
	const [name, setName] = useState("")

	// 创建聊天室
	const createChat = async () => {
		const res = await chatCreateRequire(roleId, name)
		if (res?.code === 200) {
			toast.success('创建成功', { icon: '✅' });
			setName("")
			createDone()
		}
	}

	return <dialog id="create_chat" className="modal modal-top sm:modal-middle" ref={ref}>
		<div className="modal-box">
			<h3 className="font-bold text-lg">创建角色</h3>
			<p className="py-4">输入聊天室名字</p>
			<input type="text" placeholder="请输入聊天室名字..." className="input" value={name} onChange={(e) => setName(e.target.value)} />
			<div className="modal-action">
				<form method="dialog">
					<button className="btn btn-primary mr-2" onClick={() => createChat()}>创建</button>
					<button className="btn">取消</button>
				</form>
			</div>
		</div>
	</dialog>
}

const useChatRooms = () => {
	const [chatRooms, setChatRooms] = useState<ChatListRequireType[]>([])
	const [loading, setLoading] = useState(false)

	const getChatRooms = useCallback(async () => {
		try {
			setLoading(true)
			const res = await chatListRequire()
			if (res?.code === 200) {
				setChatRooms(res.data)
			}
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		getChatRooms()
	}, [])

	return { chatRooms, getChatRooms, loading }
}

export default function Home() {
	const createChatModal = useRef<HTMLDialogElement | null>(null)
	const aiRoleModal = useRef<HTMLDialogElement | null>(null)
	const { roles, loading } = useRoleModals()
	const [roleId, setRoleId] = useState(0)
	const { chatRooms, getChatRooms, loading: chatRoomsLoading } = useChatRooms()

	useEffect(() => {
		initialLogin()
	}, [])

	const onClickCreateChat = (roleId: number) => {
		setRoleId(roleId)
		createChatModal.current?.showModal()
	}

	const onCreateDone = async () => {
		await getChatRooms()
		aiRoleModal.current?.close()
	}

	return <>
		<div className="navbar bg-base-100 shadow-sm fixed top-0 left-0 right-0 z-10">
			<div className="flex-1">
				<a className="btn btn-ghost text-xl">AI聊天</a>
			</div>
			<div className="flex-none">
				<ul className="menu menu-horizontal px-1">
					<li onClick={() => aiRoleModal.current?.showModal()}><a>AI角色</a></li>
				</ul>
			</div>
		</div>
		<div className="h-[65px]"></div>

		<main>
			<ul>
				{chatRoomsLoading ? <LoadingBox /> : chatRooms.map(room => {
					return <li className="flex justify-between px-2 py-2 border-b border-gray-200" key={room.id}>
						<div className="flex">
							<div className="w-16 h-16 mr-3 rounded-xl overflow-hidden">
								<img src={room.role.img} alt="" className="w-full h-full object-cover" />
							</div>
							<h3 className="font-bold">{room.name}</h3>
						</div>
						<div className="h-full">
							<p className="text-xs text-gray-500">{dayjs(room.createdTime).format("YYYY-MM-DD hh:mm:ss")}</p>
							<p className="text-xs text-gray-500 mt-2 text-right">角色: {room.role.name}</p>
						</div>
					</li>
				})}
			</ul>
		</main>

		<dialog id="ai_role_modal" className="modal" ref={aiRoleModal}>
			<div className="modal-box w-full h-full">
				<form method="dialog">
					<button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
				</form>
				<h3 className="font-bold text-lg">AI角色</h3>

				{loading ? <LoadingBox /> : roles ? <div className="grid grid-cols-2 gap-4 mt-4">{roles.map(role => {
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
								<button className="btn btn-primary" onClick={() => onClickCreateChat(role.id)}>创建</button>
							</div>
						</div>
					</div>
				})} </div> : <div>暂无角色</div>}
			</div>
		</dialog>
		<CreateChatDialog ref={createChatModal} roleId={roleId} createDone={onCreateDone} />
	</>;
}
