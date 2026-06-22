import { supabase } from './supabase'
import type { FamilyMember } from '@/types'

// 計算使用者及其 2 等親的所有成員 ID
export async function getSecondDegreeRelatives(userId: string): Promise<string[]> {
  try {
    // 先找到該使用者對應的家族成員
    const { data: userMember } = await supabase
      .from('family_members')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!userMember) {
      return []
    }

    const memberId = userMember.id
    const relativeIds = new Set<string>()

    // 1. 加入本人
    relativeIds.add(memberId)

    // 2. 取得該成員的直系親屬關係
    const { data: selfRelation } = await supabase
      .from('family_relations')
      .select('*')
      .eq('member_id', memberId)
      .single()

    if (selfRelation) {
      // 加入父母
      if (selfRelation.father_id) relativeIds.add(selfRelation.father_id)
      if (selfRelation.mother_id) relativeIds.add(selfRelation.mother_id)
      // 加入配偶
      if (selfRelation.spouse_id) relativeIds.add(selfRelation.spouse_id)
    }

    // 3. 加入子女（反向查詢）
    const { data: childRelations } = await supabase
      .from('family_relations')
      .select('member_id')
      .or(`father_id.eq.${memberId},mother_id.eq.${memberId}`)

    if (childRelations) {
      childRelations.forEach(r => relativeIds.add(r.member_id))
    }

    // 4. 加入兄妹（通過父母）
    if (selfRelation?.father_id || selfRelation?.mother_id) {
      const parentId = selfRelation.father_id || selfRelation.mother_id
      const { data: siblingRelations } = await supabase
        .from('family_relations')
        .select('member_id')
        .or(`father_id.eq.${parentId},mother_id.eq.${parentId}`)

      if (siblingRelations) {
        siblingRelations.forEach(r => relativeIds.add(r.member_id))
      }
    }

    return Array.from(relativeIds)
  } catch (error) {
    console.error('Error calculating relatives:', error)
    return []
  }
}

// 取得所有可代表 RSVP 的成員
export async function getRepresentableMembers(userId: string): Promise<FamilyMember[]> {
  try {
    const relativeIds = await getSecondDegreeRelatives(userId)

    if (relativeIds.length === 0) {
      return []
    }

    const { data } = await supabase
      .from('family_members')
      .select('*')
      .in('id', relativeIds)
      .order('name', { ascending: true })

    return data || []
  } catch (error) {
    console.error('Error fetching representable members:', error)
    return []
  }
}
