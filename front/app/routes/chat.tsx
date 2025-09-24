import { useNavigate, useParams } from "react-router";
import { BsChevronLeft } from 'react-icons/bs';
import { useEffect, useRef, useState } from "react";
import { chatContent } from "~/api/chatSSE";
import type { ChatContentChatType, ChatContentMsgType } from "~/api/chatSSE.type";
import { LuVolume, LuVolume1, LuVolume2 } from 'react-icons/lu';

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
	// content更新的次数， 用来控制是否可以默认播放 只有更新的次数大于2时才可默认播放
	const [contentCount, seContentCount] = useState(0)

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

	useEffect(() => {
		console.log(content, chat)
		seContentCount(contentCount + 1)
	}, [content, chat])

	return <>
		<div className="navbar bg-base-100 shadow-sm fixed top-0 left-0 right-0 z-10">
			<div className="flex-1">
				<div className="flex items-center">
					<BsChevronLeft size={22} onClick={() => navigate(-1)} />
					<a className="btn btn-ghost text-xl">{chat?.name}</a>
				</div>
			</div>
			<div className="flex-none">
			</div>
		</div>
		<div className="h-[65px]"></div>

		<main>
			<ul>
				{content.map((msg, idx) => {
					return <ChatMessage defaultPlay={msg.msgType == 2 && content.length == idx + 1 && contentCount > 2} typ={msg.msgType} key={msg.id} audioLink={msg.audioLink} onPlay={handlePlay} >
						{msg.msgType == 1 ? <div className="w-14 h-14 rounded-full mr-2 flex justify-center items-center bg-amber-400 text-xl font-bold text-white">我</div> : <img src={chat?.role.img} className="w-14 h-14 rounded-full mr-2" />}

					</ChatMessage>
				})}
			</ul>
		</main >
	</>
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