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
	controller := RoleController{}

	roleRouter := router.ApiRouter().Group("/role", router.AuthMiddleware())
	roleRouter.GET("/get_roles", controller.GetRoles)
}

type RoleController struct{}

// 获取角色列表
func (RoleController) GetRoles(c *gin.Context) {
	var roles []entity.Role

	if err := db.DB().Find(&roles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.ResponseInternalServerErr("获取失败, 原因：少打听"))
		return
	}

	c.JSON(http.StatusOK, response.ResponseOk(roles))
}
