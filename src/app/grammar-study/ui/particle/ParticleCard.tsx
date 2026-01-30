'use client'

import type { Particle, GrammarExample } from '@/data/grammar'
import { SpeakerButton } from '../common'

interface ParticleCardProps {
  particle: Particle
  isExpanded: boolean
  onToggle: () => void
}

function ExampleItem({ example }: { example: GrammarExample }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-black dark:text-white">{example.japanese}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{example.reading}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{example.korean}</p>
        </div>
        <SpeakerButton
          text={example.japanese}
          reading={example.reading}
          className="p-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-full transition-colors flex-shrink-0 text-zinc-600 dark:text-zinc-400"
          iconClassName="w-4 h-4"
        />
      </div>
    </div>
  )
}

export default function ParticleCard({ particle, isExpanded, onToggle }: ParticleCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="text-4xl font-bold text-orange-600 dark:text-orange-400 min-w-[60px] text-center">
          {particle.particle}
        </span>
        <div className="flex-1">
          <p className="text-lg font-medium text-black dark:text-white">
            {particle.name}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {particle.mainUsage}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded">
            {particle.level}
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 text-xl">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="pt-4 space-y-4">
            {/* 용법별 설명 */}
            {particle.usages.map((usage, idx) => (
              <div
                key={idx}
                className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">
                    {usage.usage}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  {usage.description}
                </p>

                {/* 예문 */}
                <div className="space-y-2">
                  {usage.examples.map((example, exIdx) => (
                    <ExampleItem key={exIdx} example={example} />
                  ))}
                </div>

                {/* 참고 사항 */}
                {usage.note && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                    * {usage.note}
                  </p>
                )}

                {/* vs 비교 */}
                {usage.vsNi && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                    💡 {usage.vsNi}
                  </p>
                )}
                {usage.vsTo && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                    💡 {usage.vsTo}
                  </p>
                )}
              </div>
            ))}

            {/* は vs が 비교 (は조사일 경우) */}
            {particle.vsGa && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {particle.vsGa.description}
                </p>
                <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {particle.vsGa.points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
