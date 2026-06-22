import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// PUT 更新使用者的管理員狀態
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { isAdmin } = await request.json()

    // 從請求取得當前使用者的 email
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      )
    }

    // 在實際應用中應該驗證 JWT token
    // 這裡簡化處理，假設已驗證
    const email = request.headers.get('X-User-Email')
    if (!email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      )
    }

    // 檢查當前使用者是否是超級管理員
    const { data: currentUser } = await supabase
      .from('users')
      .select('is_super_admin')
      .eq('email', email)
      .single()

    if (!currentUser?.is_super_admin) {
      return NextResponse.json(
        { error: '只有超級管理員可以修改管理員設定' },
        { status: 403 }
      )
    }

    // 防止移除所有超級管理員
    if (!isAdmin) {
      // 檢查要修改的使用者是否是超級管理員
      const { data: targetUser } = await supabase
        .from('users')
        .select('is_super_admin, id')
        .eq('id', userId)
        .single()

      if (targetUser?.is_super_admin) {
        // 檢查是否還有其他超級管理員
        const { data: superAdmins, count } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('is_super_admin', true)

        if (count === 1) {
          return NextResponse.json(
            { error: '至少需要一個超級管理員' },
            { status: 400 }
          )
        }
      }
    }

    // 更新使用者
    const { error } = await supabase
      .from('users')
      .update({
        is_admin: isAdmin,
        // 只有當升級為管理員時，才保留超級管理員狀態
        is_super_admin: isAdmin ? undefined : false,
      })
      .eq('id', userId)

    if (error) throw error

    return NextResponse.json({
      message: '已更新使用者狀態',
      userId,
      isAdmin,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: '更新失敗' },
      { status: 500 }
    )
  }
}
