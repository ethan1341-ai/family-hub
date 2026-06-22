'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  isAdmin: boolean
  isSuperAdmin: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  useEffect(() => {
    checkPermissions()
    fetchUsers()
  }, [])

  const checkPermissions = async () => {
    try {
      const email = localStorage.getItem('user_email')
      if (!email) {
        setIsSuperAdmin(false)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('is_super_admin')
        .eq('email', email)
        .single()

      if (error || !data) {
        setIsSuperAdmin(false)
        return
      }

      setIsSuperAdmin(data.is_super_admin)
    } catch (err) {
      console.error('Permission check error:', err)
      setIsSuperAdmin(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('id, email, is_admin, is_super_admin, created_at')
        .order('created_at', { ascending: true })

      if (error) {
        throw new Error(error.message)
      }

      const formattedUsers: User[] = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin,
        isSuperAdmin: user.is_super_admin,
        createdAt: user.created_at,
      }))

      setUsers(formattedUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : '取得使用者清單失敗')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    setError('')
    setUpdatingUserId(userId)

    try {
      const email = localStorage.getItem('user_email')
      if (!email) {
        throw new Error('未登入')
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': email,
        },
        body: JSON.stringify({
          isAdmin: !currentIsAdmin,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '更新失敗')
      }

      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗')
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 mb-4">只有超級管理員可以訪問此頁面</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← 返回
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← 返回
          </button>
          <h1 className="text-3xl font-bold text-gray-900">管理員設定</h1>
          <p className="text-gray-600 mt-2">
            管理系統中的使用者和管理員權限
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-600">載入中...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-600">沒有使用者</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      角色
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {user.isSuperAdmin ? (
                            <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                              👑 超級管理員
                            </span>
                          ) : user.isAdmin ? (
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                              🔧 管理員
                            </span>
                          ) : (
                            <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                              👤 一般成員
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.isSuperAdmin ? (
                          <span className="text-gray-500 text-xs">
                            超級管理員不可修改
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              handleToggleAdmin(user.id, user.isAdmin)
                            }
                            disabled={updatingUserId === user.id}
                            className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                              user.isAdmin
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            } disabled:opacity-50`}
                          >
                            {updatingUserId === user.id
                              ? '更新中...'
                              : user.isAdmin
                                ? '移除管理員'
                                : '設為管理員'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            ℹ️ 角色說明
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              <strong>👑 超級管理員：</strong>
              可以管理系統中的所有設定和權限
            </li>
            <li>
              <strong>🔧 管理員：</strong>
              可以建立活動、編輯成員資料等
            </li>
            <li>
              <strong>👤 一般成員：</strong>
              只能查看資訊和回覆 RSVP
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
