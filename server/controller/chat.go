package controller

import (
	"fmt"
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
	chatRouter.POST("/send", controller.SendMessage)
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

// 用户发送消息
func (cc *ChatController) SendMessage(c *gin.Context) {
	type Require struct {
		ChatId    int64  `json:"chatId" binding:"required"`
		Content   string `json:"content" binding:"required"`
		AudioLink string `json:"audioLink" binding:"required"`
	}

	var req Require

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ResponseBadRequest("参数错误"))
		return
	}

	var chat entity.Chat

	if err := db.DB().Preload("Role").Where("id = ?", req.ChatId).First(&chat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("发送失败, 原因：少打听"))
		return
	}

	// 将用户发送的消息插入数据库
	if err := db.DB().Create(&entity.ChatMsg{
		ChatId:    req.ChatId,
		MsgType:   1, // 1代表用户 2代表ai
		Content:   req.Content,
		AudioLink: req.AudioLink,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("发送失败, 原因：少打听"))
		return
	}

	// TODO: 发送消息给ai等待ai应答
	fmt.Println(chat)

	c.JSON(http.StatusOK, response.ResponseOk("发送成功"))
}
