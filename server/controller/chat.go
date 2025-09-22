package controller

import "sevent_cow/router"

func init() {
	controller := ChatController{}

	chatRouter := router.ApiRouter().Group("/chat")
}

type ChatController struct{}
