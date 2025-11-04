import "./loading-dots.scss"

interface LoadingDotsProps {
	size?: "small" | "medium" | "large"
	className?: string
}

function LoadingDots({ size = "medium", className = "" }: LoadingDotsProps) {
	return (
		<div className={`loading-dots loading-dots--${size} ${className}`}>
			<div className="loading-dots__dot"></div>
			<div className="loading-dots__dot"></div>
			<div className="loading-dots__dot"></div>
		</div>
	)
}

export { LoadingDots }
export default LoadingDots
