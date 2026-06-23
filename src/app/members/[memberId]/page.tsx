'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { FamilyMember } from '@/types'
import { supabase } from '@/lib/supabase'

export default function EditMemberPage() {
  const router = useRouter()
  const params = useParams()
  const memberId = params.memberId as string

  const [member, setMember] = useState<FamilyMember | null>(null)
  const [allMembers, setAllMembers] = useState<FamilyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    phone: '',
    lineId: '',
    industry: '',
    notes: '',
  })

  const [relations, setRelations] = useState({
    fatherId: '',
    motherId: '',
    spouseId: '',
  })

  useEffect(() => {
    checkPermissions()
    fetchMember()
    fetchAllMembers()
  }, [memberId])

  const checkPermissions = async () => {
    try {
      const email = localStorage.getItem('user_email')
      if (!email) {
        setIsAuthorized(false)
        return
      }

      // 查詢使用者是否是管理員
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('email', email)
        .single()

      if (error || !data) {
        setIsAuthorized(false)
        return
      }

      setIsAdmin(data.is_admin)
      setIsAuthorized(data.is_admin)
    } catch (err) {
      console.error('Permission check error:', err)
      setIsAuthorized(false)
    }
  }

  const fetchAllMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching members:', error)
        return
      }

      setAllMembers(data || [])
    } catch (err) {
      console.error('Error in fetchAllMembers:', err)
    }
  }

  const fetchRelations = async () => {
    try {
      const response = await fetch(
        `/api/members/${memberId}/relations`
      )
      const data = await response.json()

      if (response.ok) {
        setRelations({
          fatherId: data.fatherId || '',
          motherId: data.motherId || '',
          spouseId: data.spouseId || '',
        })
      }
    } catch (err) {
      console.error('Error fetching relations:', err)
    }
  }

  const fetchMember = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', memberId)
        .single()

      if (error || !data) {
        throw new Error('無法取得成員資料')
      }

      setMember(data)
      setFormData({
        name: data.name || '',
        nickname: data.nickname || '',
        phone: data.phone || '',
        lineId: data.line_id || '',
        industry: data.industry || '',
        notes: data.notes || '',
      })

      await fetchRelations()
    } catch (err) {
      setError(err instanceof Error ? err.message : '取得資料失敗')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRelationChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setRelations(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      const { error: updateError } = await supabase
        .from('family_members')
        .update({
          name: formData.name,
          nickname: formData.nickname,
          phone: formData.phone,
          line_id: formData.lineId,
          industry: formData.industry,
          notes: formData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      // 保存家族關係
      const relationsResponse = await fetch(
        `/api/members/${memberId}/relations`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fatherId: relations.fatherId || null,
            motherId: relations.motherId || null,
            spouseId: relations.spouseId || null,
          }),
        }
      )

      if (!relationsResponse.ok) {
        throw new Error('無法保存家族關係')
      }

      setSuccess('資料已更新')
      setTimeout(() => {
        router.push('/members')
      }, 1500)
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
        <p className="text-center text-gray-600">無法找到成員資料</p>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 font-medium mb-4"
            >
              ← 返回
            </button>
            <h1 className="text-3xl font-bold text-gray-900">成員資料</h1>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              {/* 頭像預覽 */}
              <div className="flex items-center gap-4 pb-6 border-b">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                  {member.name.charAt(0)}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">姓名</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {member.name}
                  </p>
                </div>

                {member.nickname && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">暱稱</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {member.nickname}
                    </p>
                  </div>
                )}

                {member.phone && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">電話</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {member.phone}
                    </p>
                  </div>
                )}

                {member.lineId && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">LINE ID</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {member.lineId}
                    </p>
                  </div>
                )}

                {member.industry && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">所在產業</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {member.industry}
                    </p>
                  </div>
                )}

                {member.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">備註</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {member.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 text-center">
                  只有管理員可以編輯成員資料
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← 返回
          </button>
          <h1 className="text-3xl font-bold text-gray-900">編輯成員資料</h1>
        </div>

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
                <p className="text-gray-500 text-xs">現在顯示首字母</p>
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
                placeholder="真實名字"
              />
            </div>

            {/* 暱稱 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                暱稱
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="家人通常喊的名字"
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
                placeholder="科技、教育、醫療"
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

            {/* 家族關係 */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👨‍👩‍👧‍👦 家族關係</h3>

              <div className="grid md:grid-cols-3 gap-4">
                {/* 父親 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    父親
                  </label>
                  <select
                    name="fatherId"
                    value={relations.fatherId}
                    onChange={handleRelationChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">選擇父親...</option>
                    {allMembers
                      .filter(m => m.id !== memberId)
                      .map(m => (
                        <option key={m.id} value={m.id}>
                          {m.nickname || m.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 母親 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    母親
                  </label>
                  <select
                    name="motherId"
                    value={relations.motherId}
                    onChange={handleRelationChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">選擇母親...</option>
                    {allMembers
                      .filter(m => m.id !== memberId)
                      .map(m => (
                        <option key={m.id} value={m.id}>
                          {m.nickname || m.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 配偶 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    配偶
                  </label>
                  <select
                    name="spouseId"
                    value={relations.spouseId}
                    onChange={handleRelationChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">選擇配偶...</option>
                    {allMembers
                      .filter(m => m.id !== memberId)
                      .map(m => (
                        <option key={m.id} value={m.id}>
                          {m.nickname || m.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
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
