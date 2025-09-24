import { useNavigate, useParams } from "react-router";
import { BsChevronLeft } from 'react-icons/bs';
import { useCallback, useEffect, useRef, useState } from "react";
import { chatContent } from "~/api/chatSSE";
import type { ChatContentChatType, ChatContentMsgType } from "~/api/chatSSE.type";
import { LuVolume, LuVolume1, LuVolume2 } from 'react-icons/lu';
import toast from "react-hot-toast";
import { sendAudioRequire } from "~/api/audio";
import { sendChatMsgRequire } from "~/api/chat";

const useChatContent = (chatId: string) => {
	const [content, setContent] = useState<ChatContentMsgType[]>([])
	const [chat, setChat] = useState<ChatContentChatType>()

	useEffect(() => {
		const evtSource = chatContent(Number(chatId), (ct) => {
			setContent((content) => {
				return [...content, ...ct.msg]
			})
			if (ct.chat.id != 0) {
				setChat(ct.chat)
			}
		});

		return () => {
			evtSource.close()
		}
	}, [])

	return { content, chat }
}

export default function Chat() {
	const { chatId } = useParams<{ chatId: string }>()
	const navigate = useNavigate()
	const { content, chat } = useChatContent(chatId!)
	// defaultPlay, 是否可以默认播放最后一个ai音频
	const [defaultPlay, setDefaultPlay] = useState(false)

	const [recording, setRecording] = useState(false)

	// 当前播放的音频，全局只能有一个地方播放音频
	const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
	const handlePlay = (audio: HTMLAudioElement) => {
		// 暂停之前播放的音频
		if (currentAudio && currentAudio !== audio) {
			currentAudio.pause()
			currentAudio.currentTime = 0
		}
		setCurrentAudio(audio)
		audio.play()
	}

	// 缓存chat
	const chatRef = useRef(chat);
	useEffect(() => {
		chatRef.current = chat;
		console.log(content, chat)
	}, [content, chat])

	const onAudioBlob = async (audioBlob: Blob) => {
		const chat = chatRef.current
		// 上传录音
		const formData = new FormData()
		formData.append("audio", audioBlob, "recording.wav")
		const res = await sendAudioRequire(formData)


		// 上传语音信息
		const result = await sendChatMsgRequire({
			chatId: chat!.id,
			content: res!.data.content,
			audioLink: res!.data.audioLink
		})
		// TODO: 需要做loading效果
		console.log(result);
	}

	return <div className="relative">
		<div className="navbar bg-base-100 shadow-sm">
			<div className="flex-1">
				<div className="flex items-center">
					<BsChevronLeft size={22} onClick={() => navigate(-1)} />
					<a className="btn btn-ghost text-xl">{chat?.name}</a>
				</div>
			</div>
			<div className="flex-none">
			</div>
		</div>

		{recording &&
			<div className="absolute top-[65px] left-0 w-full h-[calc(100vh-65px-88px)] bg-[rgba(0,0,0,0.5)] z-50 flex justify-center items-center flex-col">
				<p className="text-xl font-bold text-white mb-4">录音中...</p>
				<span className="loading loading-bars w-20 bg-sky-300"></span>
			</div>
		}
		<main className="h-[calc(100vh-65px-88px)] overflow-y-auto">
			<ul>
				{content.map((msg, idx) => {
					return <ChatMessage defaultPlay={msg.msgType == 2 && content.length == idx + 1 && defaultPlay} typ={msg.msgType} key={msg.id} audioLink={msg.audioLink} onPlay={handlePlay} >
						{msg.msgType == 1 ? <div className="w-14 h-14 rounded-full mr-2 flex justify-center items-center bg-amber-400 text-xl font-bold text-white">我</div> : <img src={chat?.role.img} className="w-14 h-14 rounded-full mr-2" />}

					</ChatMessage>
				})}
			</ul>
		</main>

		<Recording onAudioBlob={onAudioBlob} onStart={() => {
			setRecording(true)
			setDefaultPlay(true)
		}} onStop={() => setRecording(false)} />
	</div>
}

// typ 消息类型 1 用户 2 AI
function ChatMessage(
	{ children, typ, audioLink, onPlay, defaultPlay }:
		{ children?: React.ReactNode, typ: number, audioLink: string, onPlay: (audio: HTMLAudioElement) => void, defaultPlay: boolean }
) {
	const [duration, setDuration] = useState(0)
	const audioRef = useRef<HTMLAudioElement>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [volumeIcon, setVolumeIcon] = useState(<LuVolume2 size={26} color="#fff" className={`${typ == 1 && "scale-x-[-1]"}`} />)

	useEffect(() => {
		const audio = audioRef.current!

		const handleLoadedMetadata = () => {
			setDuration(parseInt((audio?.duration || 0).toString()))
		};

		const handleEnded = () => setIsPlaying(false)
		const handlePlay = () => setIsPlaying(true)
		const handlePause = () => setIsPlaying(false)


		audio.addEventListener("loadedmetadata", handleLoadedMetadata)
		audio.addEventListener("ended", handleEnded)
		audio.addEventListener("play", handlePlay)
		audio.addEventListener("pause", handlePause)

		if (defaultPlay) {
			audio.play()
		}

		return () => {
			audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
			audio.removeEventListener("ended", handleEnded)
			audio.removeEventListener("play", handlePlay)
			audio.removeEventListener("pause", handlePause)
		}
	}, [])

	function togglePlay() {
		const audio = audioRef.current!
		isPlaying ? audio.pause() : onPlay(audio)
		isPlaying && (audio.currentTime = 0)
		setIsPlaying(!isPlaying)
	}

	useEffect(() => {
		if (!isPlaying) {
			return
		}

		let idx = 0
		const timer = setInterval(() => {
			if (idx == 0) {
				setVolumeIcon(<LuVolume size={26} color="#fff" className={`${typ == 1 && "scale-x-[-1]"}`} />)
			} else if (idx == 1) {
				setVolumeIcon(<LuVolume1 size={26} color="#fff" className={`${typ == 1 && "scale-x-[-1]"}`} />)
			} else {
				setVolumeIcon(<LuVolume2 size={26} color="#fff" className={`${typ == 1 && "scale-x-[-1]"}`} />)
			}
			idx++
			if (idx > 2) {
				idx = 0
			}
		}, 500)

		return () => {
			clearInterval(timer)
			setVolumeIcon(<LuVolume2 size={26} color="#fff" className={`${typ == 1 && "scale-x-[-1]"}`} />)
		}
	}, [isPlaying])

	return <>
		<audio ref={audioRef} src={audioLink} />
		<li className={`flex items-center py-2 px-2 ${typ == 1 ? 'justify-end' : 'justify-start'}`}>
			{
				typ == 1 ? (
					<>
						<div className="w-24 h-10 bg-green-400 rounded-xl mr-2 flex items-center pr-2 justify-end" onClick={togglePlay}>
							<span className="text-xs mr-3 text-white">{duration}s</span>
							{volumeIcon}
						</div>
						{children}
					</>
				) : (
					<>
						{children}
						<div className="w-24 h-10 bg-sky-400 rounded-xl ml-2 flex items-center pl-2" onClick={togglePlay}>
							{volumeIcon}
							<span className="text-xs ml-3 text-white">{duration}s</span>
						</div>
					</>
				)
			}


		</li>
	</>
}

// 底部录音按钮
function Recording({ onStart, onStop, onAudioBlob }: { onStart: () => void, onStop: () => void, onAudioBlob: (b: Blob) => Promise<void> }) {
	const mediaRecorderRef = useRef<MediaRecorder>(null);
	const audioChunksRef = useRef<Blob[]>([]);

	const startRecording = async () => {
		onStart()
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
			mediaRecorderRef.current = new MediaRecorder(stream)

			mediaRecorderRef.current.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data)
				}
			};

			mediaRecorderRef.current.onstop = async () => {
				const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
				onAudioBlob(audioBlob)
			}

			mediaRecorderRef.current.start()
		} catch (err) {
			toast.error("录音失败: " + err)
		}
	};

	const stopRecording = () => {
		onStop()
		mediaRecorderRef.current?.stop();
	};

	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const button = buttonRef.current!

		const handleTouchStart = (e: TouchEvent) => {
			e.preventDefault()
			startRecording()

		};

		const handleTouchEnd = (e: TouchEvent) => {
			e.preventDefault()
			stopRecording()
		};

		button.addEventListener("touchstart", handleTouchStart, { passive: false })
		button.addEventListener("touchend", handleTouchEnd, { passive: false })

		return () => {
			button.removeEventListener("touchstart", handleTouchStart)
			button.removeEventListener("touchend", handleTouchEnd)
		};
	}, []);

	return <>
		<footer className="w-full flex justify-center items-center py-1">
			<button ref={buttonRef} className="w-20 h-20 rounded-full bg-red-400 border-4 border-gray-200"></button>
		</footer>
	</>
}