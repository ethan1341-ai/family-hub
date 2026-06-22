'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('session_token')
    setIsLoggedIn(!!token)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xl text-gray-600">
            清楚看到家族關係、管理聚餐活動、維護成員資訊
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 成員列表卡片 */}
          <Link
            href="/members"
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer block"
          >
            <div className="p-8">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="font-bold text-2xl mb-2 text-gray-900">成員列表</h3>
              <p className="text-gray-600">
                統一管理聯絡方式、照片、產業資訊
              </p>
            </div>
          </Link>

          {/* 聚餐活動卡片 */}
          <Link
            href="/events"
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer block"
          >
            <div className="p-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="font-bold text-2xl mb-2 text-gray-900">聚餐活動</h3>
              <p className="text-gray-600">
                發送邀請、統計 RSVP、管理出席狀況
              </p>
            </div>
          </Link>

          {/* 家族樹卡片 */}
          <Link
            href="/family"
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer block"
          >
            <div className="p-8">
              <div className="text-5xl mb-4">🌳</div>
              <h3 className="font-bold text-2xl mb-2 text-gray-900">家族樹</h3>
              <p className="text-gray-600">
                清楚展示父母、子女、夫妻、兄弟姊妹關係
              </p>
            </div>
          </Link>
        </div>

        {!isLoggedIn && (
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-4">還未登入？</p>
            <a
              href="/auth/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              登入/註冊
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
