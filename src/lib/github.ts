// GitHub REST API helper for the visual admin dashboard

const GITHUB_OWNER = 'Adhiraj2601'
const GITHUB_REPO = 'adhiraj-internet-cabinet'
const GITHUB_BRANCH = 'master'

export interface GitHubCommitResult {
  success: boolean
  message: string
  sha?: string
  commitUrl?: string
}

// Convert string to base64 safely supporting UTF-8
export function utf8ToBase64(str: string): string {
  return window.btoa(unescape(encodeURIComponent(str)))
}

// Convert base64 to UTF-8 string
export function base64ToUtf8(str: string): string {
  return decodeURIComponent(escape(window.atob(str)))
}

// Test if the GitHub token is valid and has access to the repository
export async function testGitHubToken(token: string): Promise<{ valid: boolean; user?: string; error?: string }> {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })
    if (!res.ok) {
      return { valid: false, error: 'Invalid GitHub token. Please verify token permissions.' }
    }
    const data = await res.json()
    return { valid: true, user: data.login }
  } catch (err: unknown) {
    return { valid: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}

// Get the current SHA of a file in the repository (needed for GitHub PUT updates)
export async function getFileSha(token: string, filePath: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )
    if (res.ok) {
      const data = await res.json()
      return data.sha
    }
    return null
  } catch {
    return null
  }
}

// Commit a file update directly to GitHub
export async function commitFileToGitHub(
  token: string,
  filePath: string,
  contentBase64: string,
  commitMessage: string
): Promise<GitHubCommitResult> {
  try {
    // 1. Fetch current SHA if the file exists
    const currentSha = await getFileSha(token, filePath)

    // 2. Put file contents
    const payload: { message: string; content: string; branch: string; sha?: string } = {
      message: commitMessage,
      content: contentBase64,
      branch: GITHUB_BRANCH,
    }
    if (currentSha) {
      payload.sha = currentSha
    }

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      const errorData = await res.json()
      return {
        success: false,
        message: errorData.message || 'Failed to commit file to GitHub',
      }
    }

    const data = await res.json()
    return {
      success: true,
      message: 'Successfully committed to GitHub!',
      sha: data.commit?.sha,
      commitUrl: data.commit?.html_url,
    }
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to publish to GitHub',
    }
  }
}

// Convert a browser File object to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}
