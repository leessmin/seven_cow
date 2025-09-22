package response

import "testing"

func TestResponseOk(t *testing.T) {
	res := ResponseOk("")
	if res.Msg != "请求成功" {
		t.Errorf("01判断错误，msg: %s", res.Msg)
	}

	res = ResponseOk("", "测试测试")
	if res.Msg != "测试测试" {
		t.Errorf("02判断错误，msg: %s", res.Msg)
	}
}
