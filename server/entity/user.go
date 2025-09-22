package entity

// 用户表
type User struct {
	ID          int64  `gorm:"primaryKey;column:id" json:"id"`
	Fingerprint string `gorm:"column:fingerprint" json:"fingerprint"`
	CreatedTime string `gorm:"column:created_time;default:" json:"createdTime"`
}
