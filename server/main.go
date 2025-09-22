package main

import (
	"sevent_cow/config"
	_ "sevent_cow/controller"
	"sevent_cow/router"
)

func main() {

	router.Run(config.ConfigValue().Server.Addr)
}
