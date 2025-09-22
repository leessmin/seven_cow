package router

import (
	"net/http"
	"sevent_cow/response"

	"github.com/gin-gonic/gin"
)

// 中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		token := ctx.GetHeader("Authorization")

		if len(token) < 7 {
			ctx.JSON(http.StatusUnauthorized, response.ResponseUnauthorized())
			ctx.Abort()
			return
		}

		userId := token[7:]
		if userId == "" {
			ctx.JSON(http.StatusUnauthorized, response.ResponseUnauthorized())
			ctx.Abort()
			return
		}

		ctx.Set("userId", userId)

		ctx.Next()
	}
}
