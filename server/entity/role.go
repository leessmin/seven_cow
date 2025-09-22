package entity

// ai角色
type Role struct {
	ID     int64  `gorm:"primaryKey;column:id" json:"id"`
	Name   string `gorm:"column:name" json:"name"`
	Prompt string `gorm:"column:prompt" json:"prompt"`
	Img    string `gorm:"column:img" json:"img"`
}
