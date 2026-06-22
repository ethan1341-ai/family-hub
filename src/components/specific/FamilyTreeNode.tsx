'use client'

import { useState } from 'react'
import type { FamilyMember } from '@/types'

interface FamilyTreeNodeProps {
  member: FamilyMember
  allMembers: FamilyMember[]
  level?: number
}

export default function FamilyTreeNode({
  member,
  allMembers,
  level = 0,
}: FamilyTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 找到相關的家族成員
  const father = allMembers.find(m => m.id === member.relations?.father_id)
  const mother = allMembers.find(m => m.id === member.relations?.mother_id)
  const spouse = allMembers.find(m => m.id === member.relations?.spouse_id)
  const children = allMembers.filter(m =>
    member.relations?.children_ids?.includes(m.id)
  )

  const hasFamily = !!father || !!mother || !!spouse || children.length > 0

  return (
    <div style={{ marginLeft: `${level * 24}px` }} className="mb-2">
      {/* 主卡片 */}
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-500 p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left flex items-start justify-between hover:bg-gray-50 p-2 -m-2 rounded"
        >
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">
              {member.nickname || member.name}
            </h3>
            <p className="text-sm text-gray-600">
              {member.nickname && `(${member.name})`}
            </p>
            {member.phone && (
              <p className="text-sm text-gray-500 mt-1">📱 {member.phone}</p>
            )}
            {member.industry && (
              <p className="text-sm text-gray-500">💼 {member.industry}</p>
            )}
          </div>

          {hasFamily && (
            <div className="flex-shrink-0 ml-2">
              <span className={`text-lg transform transition ${isExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </div>
          )}
        </button>

        {/* 展開的家族資訊 */}
        {isExpanded && hasFamily && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            {/* 父親 */}
            {father && (
              <div className="bg-blue-50 rounded p-3">
                <p className="text-xs font-semibold text-blue-600 mb-1">👨 父親</p>
                <p className="font-medium text-gray-900">
                  {father.nickname || father.name}
                </p>
              </div>
            )}

            {/* 母親 */}
            {mother && (
              <div className="bg-pink-50 rounded p-3">
                <p className="text-xs font-semibold text-pink-600 mb-1">👩 母親</p>
                <p className="font-medium text-gray-900">
                  {mother.nickname || mother.name}
                </p>
              </div>
            )}

            {/* 配偶 */}
            {spouse && (
              <div className="bg-purple-50 rounded p-3">
                <p className="text-xs font-semibold text-purple-600 mb-1">💑 配偶</p>
                <p className="font-medium text-gray-900">
                  {spouse.nickname || spouse.name}
                </p>
              </div>
            )}

            {/* 子女 */}
            {children.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-600 mb-2">👧👦 子女</p>
                <div className="space-y-2">
                  {children.map(child => (
                    <div
                      key={child.id}
                      className="bg-green-50 rounded p-3 cursor-pointer hover:bg-green-100 transition"
                    >
                      <p className="font-medium text-gray-900">
                        {child.nickname || child.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
