package llm

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"sevent_cow/config"
	"strings"
)

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Stream   bool      `json:"stream"`
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
}

func NewChatRequest(messages []Message) *ChatRequest {
	return &ChatRequest{
		Stream:   false,
		Model:    config.ConfigValue().LLM.ModelType,
		Messages: messages,
	}
}

func NewMessages(systemContent, userContent string, historyMsg []Message) []Message {
	historyMsg = append(historyMsg, Message{
		Role:    "system",
		Content: systemContent,
	}, Message{
		Role:    "user",
		Content: userContent,
	})
	return historyMsg
}

// 请求大语言模型
func RequireLLM(reqBody ChatRequest) (string, error) {
	method := "POST"

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	client := &http.Client{}
	req, err := http.NewRequest(method, config.ConfigValue().LLM.ModelUri+"/chat/completions", bytes.NewBuffer(payload))
	if err != nil {
		return "", err
	}

	req.Header.Add("Authorization", "Bearer "+config.ConfigValue().LLM.LlmApiKey)
	req.Header.Add("Content-Type", "application/json")

	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}

	if res.StatusCode != http.StatusOK {
		return "", fmt.Errorf("LLM请求失败: %s", string(body))
	}

	var resp LLVMResponse
	err = json.Unmarshal([]byte(body), &resp)
	if err != nil {
		return "", err
	}

	// 匹配 <think>...</think>
	re := regexp.MustCompile(`(?s)<think>.*?</think>`)

	return strings.Trim(re.ReplaceAllString(resp.Choices[0].Message.Content, ""), "\n"), nil
}

type LLVMResponse struct {
	Id      string `json:"id"`
	Object  string `json:"object"`
	Created int    `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index   int `json:"index"`
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		Finish_reason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		Prompt_tokens         int `json:"prompt_tokens"`
		Completion_tokens     int `json:"completion_tokens"`
		Total_tokens          int `json:"total_tokens"`
		Prompt_tokens_details struct {
		} `json:"prompt_tokens_details"`
		Completion_tokens_details struct {
		} `json:"completion_tokens_details"`
	} `json:"usage"`
}
