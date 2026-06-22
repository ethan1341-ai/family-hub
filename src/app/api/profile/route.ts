import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const email = req.headers.get('x-user-email')

    if (!email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      )
    }

    // 1. 查找 user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: '找不到用戶' },
        { status: 404 }
      )
    }

    // 2. 查找 member
    const { data: memberData, error: memberError } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', userData.id)
      .single()

    if (memberError) {
      return NextResponse.json(
        { error: '找不到成員資料' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      member: memberData,
      userId: userData.id,
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const email = req.headers.get('x-user-email')

    if (!email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      )
    }

    const { memberId, lineId, ...updateData } = await req.json()

    // 更新 family_members（正確的欄位名稱）
    const { data: memberData, error: memberError } = await supabase
      .from('family_members')
      .update({
        ...updateData,
        line_id: lineId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .select()
      .single()

    if (memberError) {
      return NextResponse.json(
        { error: memberError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: '更新成功',
      member: memberData,
    })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
