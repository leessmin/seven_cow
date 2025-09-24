export type ChatContentMsgType = {
	id: number,
	content: string,
	audioLink: string,
	createdTime: string,
	msgType: number,
	chatId: number,
}

export type ChatContentChatType = {
	id: number,
	roleId: number,
	userId: number,
	createdTime: string,
	name: string,
	role: {
		id: number,
		name: string,
		prompt: string,
		img: string,
	},
}

export type ChatContentType = {
	chat: ChatContentChatType,
	msg: ChatContentMsgType[],
}