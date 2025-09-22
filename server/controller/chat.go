package controller

import (
	"net/http"
	"sevent_cow/db"
	"sevent_cow/entity"
	"sevent_cow/response"
	"sevent_cow/router"

	"github.com/gin-gonic/gin"
)

func init() {
	controller := ChatController{}

	chatRouter := router.ApiRouter().Group("/chat", router.AuthMiddleware())

	chatRouter.POST("/create", controller.CreateChat)
}

type ChatController struct{}

// 创建聊天窗口
func (cc *ChatController) CreateChat(c *gin.Context) {
	type Require struct {
		RoleId int64  `json:"roleId" binding:"required"`
		Name   string `json:"name" binding:"required"`
	}

	userId, _ := c.Get("userId")
	uId := userId.(int64)

	var req Require

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ResponseBadRequest("参数错误"))
		return
	}

	if err := db.DB().Create(&entity.Chat{
		UserId: uId,
		RoleId: req.RoleId,
		Name:   req.Name,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("创建失败, 原因：少打听"))
		return
	}

	c.JSON(http.StatusOK, response.ResponseOk("创建成功"))
}
