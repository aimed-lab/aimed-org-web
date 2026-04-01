"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface MemberProfile {
  id: number
  name: string
  email: string
  role: string
  status: string
  joinDate: string
  isAdmin?: boolean
  bio?: string
  headshot?: string
  orcidId?: string
  githubUsername?: string
  notionPageUrl?: string
  boxFolderUrl?: string
  boxFolderId?: string
  resumeUrl?: string
  goals?: Array<{
    id: number
    quarter: string
    title: string
    description: string | null
    status: string
    notes: string | null
  }>
}

/**
 * Shared hook for member pages.
 * Fetches /api/member/me, handles auth redirect, returns member + loading + portalRole.
 */
export function useMember() {
  const router = useRouter()
  const [member, setMember] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/member/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated")
        return res.json()
      })
      .then((data) => {
        setMember(data)
        setLoading(false)
      })
      .catch(() => {
        router.push("/admin")
      })
  }, [router])

  const portalRole = member?.isAdmin ? ("admin" as const) : ("member" as const)

  return { member, loading, portalRole }
}
