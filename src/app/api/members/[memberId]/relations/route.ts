import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET 取得該成員的家族關係
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params

    const { data, error } = await supabase
      .from('family_relations')
      .select('*')
      .eq('member_id', memberId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 是「沒有記錄」的錯誤，這是正常的
      throw error
    }

    return NextResponse.json({
      fatherId: data?.father_id || null,
      motherId: data?.mother_id || null,
      spouseId: data?.spouse_id || null,
    })
  } catch (error) {
    console.error('Error fetching relations:', error)
    return NextResponse.json(
      { error: '無法取得家族關係資料' },
      { status: 500 }
    )
  }
}

// PUT 更新該成員的家族關係
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params
    const { fatherId, motherId, spouseId } = await request.json()

    // 先檢查是否已存在該成員的關係記錄
    const { data: existingRelation } = await supabase
      .from('family_relations')
      .select('id')
      .eq('member_id', memberId)
      .single()

    if (existingRelation) {
      // 如果存在，則更新
      const { error } = await supabase
        .from('family_relations')
        .update({
          father_id: fatherId,
          mother_id: motherId,
          spouse_id: spouseId,
        })
        .eq('member_id', memberId)

      if (error) throw error
    } else {
      // 如果不存在，則新增
      const { error } = await supabase
        .from('family_relations')
        .insert({
          member_id: memberId,
          father_id: fatherId,
          mother_id: motherId,
          spouse_id: spouseId,
        })

      if (error) throw error
    }

    return NextResponse.json({
      message: '家族關係已更新',
      fatherId,
      motherId,
      spouseId,
    })
  } catch (error) {
    console.error('Error updating relations:', error)
    return NextResponse.json(
      { error: '無法更新家族關係' },
      { status: 500 }
    )
  }
}
