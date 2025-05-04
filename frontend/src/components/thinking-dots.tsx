import { useEffect, useState } from "react"

export default function ThinkingDots() {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ""
        return prev + "。"
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return <span className="inline-block min-w-[30px] text-pink-500 font-bold">{dots}</span>
}
