import type { FamilyMember } from '@/types'
import Link from 'next/link'

interface FamilyMemberCardProps {
  member: FamilyMember
  onClick?: () => void
  clickable?: boolean
  editable?: boolean
}

export default function FamilyMemberCard({
  member,
  onClick,
  clickable = true,
  editable = false
}: FamilyMemberCardProps) {
  const cardContent = (
    <div className="flex gap-4 w-full">
      {/* 照片 */}
      <div className="flex-shrink-0">
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={member.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
            {member.name.charAt(0)}
          </div>
        )}
      </div>

      {/* 資訊 */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-1">
          {member.nickname && (
            <h3 className="text-lg font-bold text-gray-900">
              {member.nickname}
            </h3>
          )}
          <p className={`text-gray-600 ${member.nickname ? 'text-sm' : 'text-base'}`}>
            {member.name}
          </p>
          {member.phone && (
            <p className="text-sm text-gray-500 truncate">
              📱 {member.phone}
            </p>
          )}
          {member.industry && (
            <p className="text-sm text-gray-500 truncate">
              💼 {member.industry}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  if (editable) {
    return (
      <Link href={`/members/${member.id}`}>
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-4">
          {cardContent}
        </div>
      </Link>
    )
  }

  if (clickable) {
    return (
      <div
        onClick={onClick}
        className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-4"
      >
        {cardContent}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {cardContent}
    </div>
  )
}
