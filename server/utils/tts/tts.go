package tts

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sevent_cow/config"
	"time"
)

type AudioConfig struct {
	VoiceType  string  `json:"voice_type"`
	Encoding   string  `json:"encoding"`
	SpeedRatio float64 `json:"speed_ratio"`
}

type TTSRequest struct {
	Audio   AudioConfig `json:"audio"`
	Request struct {
		Text string `json:"text"`
	} `json:"request"`
}

type TTSResponse struct {
	ReqID     string `json:"reqid"`
	Operation string `json:"operation"`
	Sequence  int    `json:"sequence"`
	Data      string `json:"data"` // base64 编码音频
	Addition  struct {
		Duration string `json:"duration"`
	} `json:"addition"`
}

// 文本转语音
// / text-> 文本
// / return -> 音频文件路径
// 文档 https://developer.qiniu.com/aitokenapi/12981/asr-tts-ocr-api
func TTSHandle(text string) (string, error) {

	// 构造请求结构体
	reqData := TTSRequest{
		Audio: AudioConfig{
			VoiceType:  "qiniu_zh_female_wwxkjx",
			Encoding:   "mp3",
			SpeedRatio: 1.0,
		},
	}
	reqData.Request.Text = text

	payload, err := json.Marshal(reqData)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", config.ConfigValue().LLM.ModelUri+"/voice/tts", bytes.NewBuffer(payload))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+config.ConfigValue().LLM.LlmApiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", err
	}

	// 解析 JSON 响应
	var ttsResp TTSResponse
	if err := json.NewDecoder(resp.Body).Decode(&ttsResp); err != nil {
		return "", err
	}

	// 解码 base64 音频数据
	audioData, err := base64.StdEncoding.DecodeString(ttsResp.Data)
	if err != nil {
		return "", err
	}

	// 文件名 时间戳 + 后缀名
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ".mp3")
	savePath := filepath.Join(config.ConfigValue().Server.UploadDir, filename)

	if err := os.WriteFile(savePath, audioData, 0644); err != nil {
		return "", err
	}

	return savePath, nil
}
