'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('session_token')
      if (token) {
        setIsLoggedIn(true)
        const email = localStorage.getItem('user_email')
        if (email) {
          setUserEmail(email)

          // 檢查是否是管理員
          const { data } = await supabase
            .from('users')
            .select('is_admin')
            .eq('email', email)
            .single()

          if (data?.is_admin) {
            setIsAdmin(true)
          }
        }
      } else {
        setIsLoggedIn(false)
      }
    } catch (err) {
      console.error('Auth check error:', err)
      setIsLoggedIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('session_token')
    localStorage.removeItem('user_email')
    setIsLoggedIn(false)
    window.location.href = '/'
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="hover:text-blue-600 transition flex items-baseline gap-1">
            <div className="text-3xl font-bold text-gray-900">康</div>
            <div className="text-sm font-semibold text-gray-600">家族</div>
          </Link>

          {isLoggedIn && (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm hover:shadow-lg transition"
                title={userEmail}
              >
                {userEmail.charAt(0).toUpperCase()}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-medium text-sm"
              >
                登出
              </button>
            </div>
          )}

          {!isLoggedIn && (
            <Link
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-medium text-sm"
            >
              登入/註冊
            </Link>
          )}
        </div>

        {isLoggedIn && (
          <nav className="flex items-center gap-8 text-sm mt-4">
            <Link
              href="/members"
              className="text-gray-700 hover:text-blue-600 font-medium transition pb-1 border-b-2 border-transparent hover:border-blue-600"
            >
              👥 成員
            </Link>
            <Link
              href="/events"
              className="text-gray-700 hover:text-blue-600 font-medium transition pb-1 border-b-2 border-transparent hover:border-blue-600"
            >
              🎉 聚餐
            </Link>
            <Link
              href="/family"
              className="text-gray-700 hover:text-blue-600 font-medium transition pb-1 border-b-2 border-transparent hover:border-blue-600"
            >
              🌳 家族樹
            </Link>
            {isAdmin && (
              <Link
                href="/admin/users"
                className="text-gray-700 hover:text-purple-600 font-medium transition pb-1 border-b-2 border-transparent hover:border-purple-600"
              >
                ⚙️ 管理
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
