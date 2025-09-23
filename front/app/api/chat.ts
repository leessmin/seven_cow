import apiFetch from "./api"
import type { Response } from "./api.type"
import type { ChatListRequireType } from "./chat.type"

// 创建聊天室
export const chatCreateRequire = async (roleId: number, name: string) => {
	return apiFetch.Require<Response<string>>("/chat/create", {
		method: "POST",
		body: JSON.stringify({ roleId, name }),
		headers: {
			"Content-Type": "application/json"
		}
	})
}

// 聊天室列表
export const chatListRequire = () => {
	return apiFetch.Require<Response<ChatListRequireType[]>>("/chat/get_chat_rooms")
}