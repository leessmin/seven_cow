package controller

import (
	"errors"
	"fmt"
	"net/http"
	"sevent_cow/db"
	"sevent_cow/entity"
	"sevent_cow/response"
	"sevent_cow/router"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func init() {
	controller := UserController{}

	userRouter := router.ApiRouter().Group("/user")

	userRouter.POST("/register", controller.Register)
}

type UserController struct{}

// 注册
func (u *UserController) Register(c *gin.Context) {
	fingerprint, b := c.GetPostForm("fingerprint")
	if !b {
		c.JSON(http.StatusBadRequest, response.ResponseBadRequest("参数错误"))
		return
	}

	// 存在相同设备则无需注册
	var user entity.User

	if err := db.DB().Where("fingerprint = ?", fingerprint).First(&user).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		fmt.Println("55", fingerprint)
		user = entity.User{
			Fingerprint: fingerprint,
		}
		db.DB().Create(&user)
	}

	c.JSON(http.StatusOK, response.ResponseOk(gin.H{
		"msg":  "注册成功",
		"user": user,
	}))
}
