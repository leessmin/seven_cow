package entity

// 聊天窗口
type Chat struct {
	ID          int64  `gorm:"primaryKey;column:id" json:"id"`
	RoleId      int64  `gorm:"column:role_id" json:"roleId"`
	UserId      int64  `gorm:"column:user_id" json:"userId"`
	CreatedTime string `gorm:"column:created_time;default:" json:"createdTime"`
	Name        string `gorm:"column:name" json:"name"`
	Role        Role   `gorm:"foreignKey:RoleId;references:ID" json:"role"`
}
