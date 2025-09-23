"use client"

export const getToken = () => {
	return window.localStorage.getItem("token") || ""
}

export const setToken = (token: string) => {
	localStorage.setItem("token", token)
}