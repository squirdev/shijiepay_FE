/* =========================
 * 类型定义
 * ========================= */

export interface WebGLInfo {
  vendor: string
  renderer: string
}

export interface FingerprintData {
  ua: string
  platform: string
  screen: string
  cpu: number
  timezone: string
  webgl: WebGLInfo | null
  canvas: string
}

export interface FingerprintResult {
  fingerprint: string
  data: FingerprintData
}

/* =========================
 * SHA-256
 * ========================= */

async function sha256(str: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))

  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/* =========================
 * Canvas 指纹
 * ========================= */

async function getCanvasHash(): Promise<string> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return ''
  }

  ctx.textBaseline = 'top'
  ctx.font = '16px Arial'
  ctx.fillStyle = '#f60'
  ctx.fillRect(100, 5, 80, 30)
  ctx.fillStyle = '#069'
  ctx.fillText('fp', 10, 40)

  return sha256(canvas.toDataURL())
}

/* =========================
 * WebGL 指纹
 * ========================= */

function getWebGL(): WebGLInfo | null {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (!gl) return null

    if (!(gl instanceof WebGLRenderingContext)) {
      return null
    }
    const debug = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debug) return null

    return {
      vendor: gl.getParameter((debug as WEBGL_debug_renderer_info).UNMASKED_VENDOR_WEBGL) as string,
      renderer: gl.getParameter(
        (debug as WEBGL_debug_renderer_info).UNMASKED_RENDERER_WEBGL
      ) as string
    }
  } catch {
    return null
  }
}

/* =========================
 * 生成浏览器指纹
 * ========================= */

export async function generateFingerprint(): Promise<FingerprintResult> {
  const canvasHash = await getCanvasHash()

  const data: FingerprintData = {
    ua: navigator.userAgent,
    platform: navigator.platform,
    screen: `${screen.width}x${screen.height}`,
    cpu: navigator.hardwareConcurrency || 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    webgl: getWebGL(),
    canvas: canvasHash
  }

  const fingerprint = await sha256(JSON.stringify(data))

  return { fingerprint, data }
}
