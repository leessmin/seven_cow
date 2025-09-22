package response

import (
	"net/http"
)

// 全局消息相应格式
type Response[T any] struct {
	Code int    `json:"code"` // 状态码
	Msg  string `json:"msg"`  // 消息内容
	Data T      `json:"data"`
}

// 自定义返回内容
func ResponseCustom[T any](code int, msg string, data T) Response[T] {
	return Response[T]{
		Code: code,
		Msg:  msg,
		Data: data,
	}
}

// 成功response
func ResponseOk[T any](data T, msg ...string) Response[T] {
	return Response[T]{
		Code: http.StatusOK,
		Msg:  defaultIfEmpty("请求成功", msg...),
		Data: data,
	}
}

// 客户端请求语法错误
func ResponseBadRequest(msg ...string) Response[any] {
	return Response[any]{
		Code: http.StatusBadRequest,
		Msg:  defaultIfEmpty("请求格式错误", msg...),
		Data: nil,
	}
}

// 客户端没有令牌
func ResponseUnauthorized(msg ...string) Response[any] {
	return Response[any]{
		Code: http.StatusUnauthorized,
		Msg:  defaultIfEmpty("没有权限", msg...),
		Data: nil,
	}
}

// 服务器内部错误
func ResponseInternalServerErr(msg ...string) Response[any] {
	return Response[any]{
		Code: http.StatusInternalServerError,
		Msg:  defaultIfEmpty("服务器内部错误", msg...),
		Data: nil,
	}
}

// 传入两个字符串，判断第二个字符串是否存在值
// 如果存在则使用第二个值，不存在使用第一个值
func defaultIfEmpty(defaultString string, val ...string) string {
	if len(val) >= 1 {
		return val[0]
	}
	return defaultString
}
