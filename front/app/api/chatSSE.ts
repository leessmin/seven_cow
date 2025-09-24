import type { ChatContentType } from "./chatSSE.type";

// 获取聊天室的内容
export const chatContent = (chatId: number, onmessage: (content: ChatContentType) => void): EventSource => {
	const evtSource = new EventSource(`/api/chat_sse/content?chatId=${chatId}`);

	// 监听服务器发送的消息
	evtSource.onmessage = (event) => {
		onmessage(JSON.parse(event.data))
	};

	// 监听连接打开
	evtSource.onopen = () => {
		console.log("SSE 已连接");
	};

	// 监听错误
	evtSource.onerror = (err) => {
		console.error("SSE 连接出错", err);
	};

	return evtSource
}