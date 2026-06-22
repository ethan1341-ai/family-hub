'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { FamilyMember } from '@/types'
import FamilyMemberCard from '@/components/shared/FamilyMemberCard'

export default function MembersPage() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fetch error:', error)
        return
      }

      setMembers(data || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 成員列表</h1>
        <p className="text-gray-600">共 {members.length} 位家族成員</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="搜尋成員名字或暱稱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">載入中...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">還沒有成員</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(member => (
            <FamilyMemberCard key={member.id} member={member} editable={true} />
          ))}
        </div>
      )}
    </div>
  )
}
