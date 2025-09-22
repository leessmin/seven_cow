package router

import (
	"net/http"
	"sevent_cow/response"
	"strconv"

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

		id := token[7:]
		if id == "" {
			ctx.JSON(http.StatusUnauthorized, response.ResponseUnauthorized())
			ctx.Abort()
			return
		}

		userId, err := strconv.Atoi(id)
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, response.ResponseUnauthorized())
			ctx.Abort()
			return
		}

		ctx.Set("userId", userId)

		ctx.Next()
	}
}
