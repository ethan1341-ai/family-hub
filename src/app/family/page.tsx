'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { FamilyMember } from '@/types'
import FamilyTreeNode from '@/components/specific/FamilyTreeNode'

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [relations, setRelations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFamilyData()
  }, [])

  const fetchFamilyData = async () => {
    try {
      setIsLoading(true)

      // 取得所有成員
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select('*')
        .order('created_at', { ascending: false })

      if (membersError) {
        console.error('Fetch error:', membersError)
        return
      }

      // 取得所有家族關係
      const { data: relationsData, error: relationsError } = await supabase
        .from('family_relations')
        .select('*')

      if (relationsError) {
        console.error('Relations error:', relationsError)
      }

      // 將家族關係合併到成員資料中，並構建 children_ids
      const membersWithRelations = (membersData || []).map(member => {
        const relation = relationsData?.find(r => r.member_id === member.id) || {}

        // 找到以此人為父母的所有子女
        const childrenIds = relationsData
          ?.filter(r => r.father_id === member.id || r.mother_id === member.id)
          ?.map(r => r.member_id) || []

        return {
          ...member,
          relations: {
            fatherId: relation.father_id,
            motherId: relation.mother_id,
            spouseId: relation.spouse_id,
            childrenIds: childrenIds,
          },
        }
      })

      setMembers(membersWithRelations)
      setRelations(relationsData || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 尋找根節點（沒有父母的人）
  const rootMembers = members.filter(m => !m.relations?.fatherId && !m.relations?.motherId)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🌳 家族樹</h1>
        <p className="text-gray-600">點擊卡片展開家族成員資訊</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">載入中...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">還沒有家族成員</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 mb-6">
            共 {members.length} 位家族成員
          </p>

          {rootMembers.length > 0 ? (
            rootMembers.map(member => (
              <FamilyTreeNode
                key={member.id}
                member={member}
                allMembers={members}
                level={0}
              />
            ))
          ) : (
            // 如果沒有根節點，顯示所有成員
            members.map(member => (
              <FamilyTreeNode
                key={member.id}
                member={member}
                allMembers={members}
                level={0}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
