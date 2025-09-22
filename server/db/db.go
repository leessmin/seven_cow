package db

import (
	"sevent_cow/config"
	"sync"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

var DB = sync.OnceValue(func() *gorm.DB {
	db, err := gorm.Open(postgres.Open(config.ConfigValue().DB.Postgresql), &gorm.Config{NamingStrategy: schema.NamingStrategy{SingularTable: true}})
	if err != nil {
		panic(err)
	}
	return db
})
