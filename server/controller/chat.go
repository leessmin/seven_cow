package controller

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sevent_cow/db"
	"sevent_cow/entity"
	"sevent_cow/internal/sse"
	"sevent_cow/response"
	"sevent_cow/router"
	"sevent_cow/utils/llm"
	"sevent_cow/utils/tts"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func init() {
	controller := ChatController{}

	chatRouter := router.ApiRouter().Group("/chat", router.AuthMiddleware())
	chatSSERouter := router.ApiRouter().Group("/chat_sse")

	chatRouter.POST("/create", controller.CreateChat)
	chatRouter.POST("/send", controller.SendMessage)
	chatRouter.GET("/get_chat_rooms", controller.GetChatRooms)
	chatSSERouter.GET("/content", controller.ChatContent)
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
		Content   string `json:"content"`
		AudioLink string `json:"audioLink" binding:"required"`
	}

	var req Require

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.ResponseBadRequest("参数错误"))
		return
	}

	var chat entity.Chat

	// 获取聊天窗口信息
	if err := db.DB().Preload("Role").Where("id = ?", req.ChatId).First(&chat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("发送失败, 原因：少打听"))
		return
	}

	// 将用户发送的消息插入数据库
	{
		chatMsg := entity.ChatMsg{
			ChatId:    req.ChatId,
			MsgType:   1, // 1代表用户 2代表ai
			Content:   req.Content,
			AudioLink: req.AudioLink,
		}
		if err := db.DB().Create(&chatMsg).Error; err != nil {
			c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("发送失败, 原因：少打听"))
			return
		}

		sse.BroadcastSSE(req.ChatId, sse.ChatContent{
			Msg: []entity.ChatMsg{chatMsg},
		})
	}

	aiContent, err := llm.RequireLLM(*llm.NewChatRequest(llm.NewMessages(chat.Role.Prompt, req.Content)))
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("发送失败, 原因：少打听"))
		return
	}

	// ai文本转语音
	aiAudioLink, err := tts.TTSHandle(aiContent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("发送失败, 原因：少打听"))
		return
	}

	// 将AI回复的消息插入数据库
	{
		chatMsg := entity.ChatMsg{
			ChatId:    req.ChatId,
			MsgType:   2, // 1代表用户 2代表ai
			Content:   aiContent,
			AudioLink: aiAudioLink,
		}
		if err := db.DB().Create(&chatMsg).Error; err != nil {
			c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("发送失败, 原因：少打听"))
			return
		}
		sse.BroadcastSSE(req.ChatId, sse.ChatContent{
			Msg: []entity.ChatMsg{chatMsg},
		})
	}

	c.JSON(http.StatusOK, response.ResponseOk("发送成功"))
}

// 聊天内容 sse 会实时推送消息
func (cc *ChatController) ChatContent(c *gin.Context) {
	chatIdStr, b := c.GetQuery("chatId")
	if !b {
		c.JSON(http.StatusBadRequest, response.ResponseBadRequest("参数错误"))
		return
	}
	chatIdInt64, err := strconv.ParseInt(chatIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ResponseBadRequest("参数错误"))
		return
	}

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Flush()

	var chat entity.Chat

	// 获取聊天窗口信息
	if err := db.DB().Preload("Role").Where("id = ?", chatIdInt64).First(&chat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("获取失败, 原因：少打听"))
		return
	}

	var chatMsgs []entity.ChatMsg

	if err := db.DB().Where("chat_id = ?", chatIdInt64).Order("created_time ASC").Find(&chatMsgs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("获取失败, 原因：少打听"))
		return
	}

	{
		err := cc.sendSSE(c, sse.ChatContent{
			Chat: chat,
			Msg:  chatMsgs,
		})
		if err != nil {
			fmt.Println("发送失败，原因：", err)
		}
	}

	// 注册 SSE channel
	ch := sse.RegisterSSE(chatIdInt64)

	for {
		// 监听 channel 推送新消息
		for msg := range ch {
			log.Println("ok")
			if err := cc.sendSSE(c, msg); err != nil {
				log.Println("sse关闭，原因：", err)
				break
			}
			time.Sleep(time.Millisecond * 50) // 防止 CPU 空转 占用过多cpu
		}
	}

}

// 获取聊天室
func (cc *ChatController) GetChatRooms(c *gin.Context) {
	userId, _ := c.Get("userId")
	uId := userId.(int64)

	var chats []entity.Chat

	if err := db.DB().Preload("Role").Where("user_id = ?", uId).Order("created_time DESC").Find(&chats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("获取失败, 原因：少打听"))
		return
	}

	c.JSON(http.StatusOK, response.ResponseOk(chats))
}

func (cc *ChatController) sendSSE(c *gin.Context, msg sse.ChatContent) error {
	data, err := json.Marshal(msg)
	if err != nil {
		// 遇到序列化失败就跳过
		return err
	}

	// 发送 SSE 消息
	fmt.Fprintf(c.Writer, "data: %s\n\n", data)
	c.Writer.Flush()
	return nil
}
