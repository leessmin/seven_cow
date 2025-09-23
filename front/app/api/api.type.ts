export type Response<T> = {
	code: number,
	msg: string,
	data: T,
}