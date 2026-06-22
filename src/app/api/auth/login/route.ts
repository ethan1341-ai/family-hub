import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: '請提供 email 和密碼' },
        { status: 400 }
      )
    }

    // 1. 用 Supabase Auth 登入
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }

    const user = authData.user
    if (!user) {
      return NextResponse.json(
        { error: '登入失敗' },
        { status: 500 }
      )
    }

    // 2. 更新 last_login_at
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('email', email)

    return NextResponse.json({
      message: '登入成功',
      session: authData.session,
      user: {
        id: user.id,
        email: user.email,
      },
    }, {
      headers: {
        'Set-Cookie': `user_email=${user.email}; Path=/; Max-Age=86400`,
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
