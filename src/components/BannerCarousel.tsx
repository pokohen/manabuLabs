'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Banner } from '@/lib/schemas/partner'

interface BannerCarouselProps {
  position: 'home' | 'drawer'
}

export default function BannerCarousel({ position }: BannerCarouselProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/banners?position=${position}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBanners(data)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [position])

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  // 자동 슬라이드 (배너 2개 이상일 때)
  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [banners.length, next])

  if (isLoading || banners.length === 0) return null

  const isHome = position === 'home'

  return (
    <div className={`relative overflow-hidden rounded-xl ${isHome ? 'w-full max-w-md' : 'w-full'}`}>
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.link_url}
            className="w-full shrink-0 block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.image_url}
              alt={banner.title}
              className={`w-full object-cover ${isHome ? 'h-36 rounded-xl' : 'h-24 rounded-lg'}`}
            />
          </Link>
        ))}
      </div>

      {/* 좌우 화살표 (배너 2개 이상) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
            aria-label="이전 배너"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
            aria-label="다음 배너"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 인디케이터 */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  i === current ? 'bg-white w-4' : 'bg-white/50'
                }`}
                aria-label={`배너 ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
