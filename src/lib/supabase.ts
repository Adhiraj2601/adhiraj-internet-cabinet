import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project')
)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface CommentRecord {
  id: string
  post_slug: string
  name: string
  text: string
  created_at: string
}

export async function fetchComments(postSlug: string): Promise<CommentRecord[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('id, post_slug, name, text, created_at')
      .eq('post_slug', postSlug)
      .order('created_at', { ascending: true })

    if (error) {
      console.warn('[Supabase] Error fetching comments:', error.message)
      return []
    }
    return (data as CommentRecord[]) || []
  } catch (err) {
    console.warn('[Supabase] Network/query error fetching comments:', err)
    return []
  }
}

export async function insertComment(
  postSlug: string,
  name: string,
  text: string
): Promise<CommentRecord | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_slug: postSlug,
          name: name.trim() || 'Anonymous',
          text: text.trim(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('[Supabase] Error posting comment:', error.message)
      return null
    }
    return data as CommentRecord
  } catch (err) {
    console.error('[Supabase] Network error posting comment:', err)
    return null
  }
}

export function formatCommentDate(isoString?: string): string {
  if (!isoString) return 'Just now'
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return 'Just now'

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 45) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  } catch {
    return 'Just now'
  }
}
