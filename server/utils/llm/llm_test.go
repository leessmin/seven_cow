package llm

import "testing"

func TestLLMRequire(t *testing.T) {
	res, _ := RequireLLM(*NewChatRequest(NewMessages("你是《Darling in the Franxx》的角色 02。用户是广。请**严格只输出对话内容，不输出任何动作、表情或人物描述**，只给出你对用户的回复。", "今天还吃晚饭吗？")))
	t.Log(res)
}
