'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FamilyMember } from '@/types'

export default function ProfilePage() {
  const router = useRouter()
  const [member, setMember] = useState<FamilyMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    phone: '',
    lineId: '',
    industry: '',
    notes: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const email = localStorage.getItem('user_email')

      if (!email) {
        router.push('/auth/login')
        return
      }

      const res = await fetch('/api/profile', {
        headers: {
          'x-user-email': email,
        },
      })

      if (!res.ok) {
        throw new Error('無法取得個人資料')
      }

      const data = await res.json()
      setMember(data.member)
      setFormData({
        name: data.member.name || '',
        nickname: data.member.nickname || '',
        phone: data.member.phone || '',
        lineId: data.member.line_id || '',
        industry: data.member.industry || '',
        notes: data.member.notes || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '取得資料失敗')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': localStorage.getItem('user_email') || '',
        },
        body: JSON.stringify({
          memberId: member?.id,
          ...formData,
          line_id: formData.lineId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '更新失敗')
      }

      const data = await res.json()
      setMember(data.member)
      setSuccess('個人資料已更新')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <p className="text-center text-gray-600">載入中...</p>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="container py-12">
        <p className="text-center text-gray-600">無法找到個人資料</p>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">👤 個人資料</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 頭像預覽 */}
            <div className="flex items-center gap-4 pb-6 border-b">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="text-gray-600 text-sm">頭像</p>
                <p className="text-gray-500 text-xs">現在顯示你的首字母</p>
                <p className="text-gray-500 text-xs mt-1">📸 上傳照片功能即將推出</p>
              </div>
            </div>

            {/* 姓名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="你的真實名字"
              />
            </div>

            {/* 暱稱 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                暱稱 (家人通常喊的名字)
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="例：小王、老大"
              />
            </div>

            {/* 聯絡方式 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="0912-345-678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LINE ID
                </label>
                <input
                  type="text"
                  name="lineId"
                  value={formData.lineId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="your.line.id"
                />
              </div>
            </div>

            {/* 所在產業 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                所在產業
              </label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="例：科技、教育、醫療"
              />
            </div>

            {/* 備註 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備註
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="其他備註"
              />
            </div>

            {/* 提交按鈕 */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '保存變更'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
