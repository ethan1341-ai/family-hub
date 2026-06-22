import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '請提供 email、密碼和名字' },
        { status: 400 }
      )
    }

    // 1. 用 Supabase Auth 建立帳號
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    const userId = authData.user?.id
    if (!userId) {
      return NextResponse.json(
        { error: '帳號建立失敗' },
        { status: 500 }
      )
    }

    // 2. 在 users 表建立記錄
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user?.user_metadata?.sub || crypto.randomUUID(),
          email,
          auth_provider: 'email',
          is_admin: false,
        },
      ])
      .select()
      .single()

    if (userError) {
      return NextResponse.json(
        { error: '建立使用者記錄失敗' },
        { status: 500 }
      )
    }

    // 3. 在 family_members 表建立成員記錄
    const { data: memberData, error: memberError } = await supabase
      .from('family_members')
      .insert([
        {
          user_id: userData.id,
          name,
          email,
          is_data_complete: false,
        },
      ])
      .select()
      .single()

    if (memberError) {
      return NextResponse.json(
        { error: '建立成員記錄失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '註冊成功',
      user: {
        id: userData.id,
        email,
        memberId: memberData.id,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
