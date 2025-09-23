package config

import (
	"os"
	"sync"

	"github.com/pelletier/go-toml/v2"
)

// 配置文件
type Config struct {
	Server struct {
		Addr      string `toml:"addr"`
		TokenSalt string `toml:"token_salt"`
		UploadDir string `toml:"upload_dir"`
	} `tome:"server"`
	DB struct {
		Postgresql string `toml:"postgresql"`
	} `toml:"db"`
	LLM struct {
		ModelType string `toml:"model_type"`
		ModelUri  string `toml:"model_uri"`
		LlmApiKey string `toml:"llvm_api_key"`
	} `toml:"llm"`
}

var ConfigValue = sync.OnceValue(func() *Config {
	content, err := os.ReadFile("./config.toml")
	if err != nil {
		panic(err)
	}

	var conf Config
	err = toml.Unmarshal([]byte(content), &conf)
	if err != nil {
		panic(err)
	}

	return &conf
})
