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
export const chatListRequire = () => apiFetch.Require<Response<ChatListRequireType[]>>("/chat/get_chat_rooms")

export const sendChatMsgRequire = (body: { chatId: number, content: string, audioLink: string }) => apiFetch.Require("/chat/send", {
	method: "POST",
	body: JSON.stringify(body),
	headers: {
		"Content-Type": "application/json"
	}
})