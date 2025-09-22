package entity

// 聊天消息
type ChatMsg struct {
	ID          int64  `gorm:"primaryKey;column:id" json:"id"`
	Content     string `gorm:"column:content" json:"content"`
	AudioLink   string `gorm:"column:audio_link" json:"audioLink"`
	CreatedTime string `gorm:"column:created_time;default:" json:"createdTime"`
	MsgType     int    `gorm:"column:msg_type" json:"msgType"`
	ChatId      int64  `gorm:"column:chat_id" json:"chatId"`
}
