
export default function LoadingBox({ className }: { className?: string }) {
	return <div className="w-full flex justify-center">
		<span className={`loading loading-infinity text-primary ${className ?? 'w-32'}`}></span>
	</div>
}