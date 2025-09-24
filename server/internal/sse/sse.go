package sse

import (
	"sevent_cow/entity"
	"sync"
)

// 发送的消息
type ChatContent struct {
	Chat entity.Chat      `json:"chat"`
	Msg  []entity.ChatMsg `json:"msg"`
}

// 每个聊天窗口对应一个 SSE channel
var ChatSSEChannels = make(map[int64]chan ChatContent)
var ChatSSELock = sync.Mutex{}

// RegisterSSE 注册一个 SSE 连接，如果 channel 不存在就创建
func RegisterSSE(chatId int64) chan ChatContent {
	ChatSSELock.Lock()
	defer ChatSSELock.Unlock()

	ch, ok := ChatSSEChannels[chatId]
	if !ok {
		ch = make(chan ChatContent)
		ChatSSEChannels[chatId] = ch
	}
	return ch
}

// BroadcastSSE 广播消息到指定 chatId 的 SSE channel
func BroadcastSSE(chatId int64, msg ChatContent) {
	ChatSSELock.Lock()
	ch, ok := ChatSSEChannels[chatId]
	ChatSSELock.Unlock()

	if ok {
		select {
		case ch <- msg: // 非阻塞发送
		default:
		}
	}
}

// UnregisterSSE 通过chatId删除 channel
func UnregisterSSE(chatId int64) {
	ChatSSELock.Lock()
	defer ChatSSELock.Unlock()

	ch, ok := ChatSSEChannels[chatId]
	if ok {
		close(ch)
		delete(ChatSSEChannels, chatId)
	}
}
