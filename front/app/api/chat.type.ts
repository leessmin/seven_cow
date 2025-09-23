export type ChatListRequireType = {
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