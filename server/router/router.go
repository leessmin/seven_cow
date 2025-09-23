package router

import (
	"sevent_cow/config"
	"sync"

	"github.com/gin-gonic/gin"
)

func init() {
	Router().Static("/upload", config.ConfigValue().Server.UploadDir)
}

// '/'
var Router = sync.OnceValue(func() *gin.Engine {
	return gin.Default()
})

// '/api'
var ApiRouter = sync.OnceValue(func() *gin.RouterGroup {
	return Router().Group("/api")
})

// 启动项目 addr监听地址
func Run(addr ...string) {
	Router().Run(addr...)
}
