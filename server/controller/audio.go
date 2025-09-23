package controller

import (
	"fmt"
	"net/http"
	"path/filepath"
	"sevent_cow/config"
	"sevent_cow/response"
	"sevent_cow/router"
	"sevent_cow/utils/whisper"
	"time"

	"github.com/gin-gonic/gin"
)

func init() {
	controller := AudioController{}

	audioRouter := router.ApiRouter().Group("/audio", router.AuthMiddleware())
	audioRouter.POST("/send", controller.SendAudio)
}

type AudioController struct{}

// 用户上传音频
func (ac *AudioController) SendAudio(c *gin.Context) {
	file, err := c.FormFile("audio")
	if err != nil {
		c.JSON(http.StatusBadRequest, response.ResponseBadRequest("参数错误"))
		return
	}

	// 文件名 时间戳 + 后缀名
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	savePath := filepath.Join(config.ConfigValue().Server.UploadDir, filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("音频保存失败，原因：少打听"))
		return
	}

	content, err := whisper.WhisperHandle(savePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("音频处理失败，原因：少打听"))
	}

	c.JSON(http.StatusOK, response.ResponseOk(gin.H{
		"audioLink": "/upload/" + filename,
		"content":   content,
	}))
}
