/**
 * Rutas de archivos en /public. Mismos nombres en local y en producción.
 *
 * Si despliegas la app bajo una subruta (poco habitual en Render), define:
 * NEXT_PUBLIC_ASSET_PREFIX=/subruta   (sin barra final)
 */
function assetUrl(rutaAbsoluta: string): string {
  const base = (process.env.NEXT_PUBLIC_ASSET_PREFIX ?? "").replace(/\/$/, "")
  const path = rutaAbsoluta.startsWith("/") ? rutaAbsoluta : `/${rutaAbsoluta}`
  return base ? `${base}${path}` : path
}

export const medios = {
  logo: assetUrl("/images/logo.png"),
  /** Misma imagen que el logo si no hay foto aparte en /public */
  fotoAsesor: assetUrl("/images/logo.png"),
  videoFeed1: assetUrl("/videos/feed-1.mp4"),
  notificacion: assetUrl("/audio/notificacion.mp3"),
  vozMensaje1: assetUrl("/audio/whatsapp-message-1.wav"),
  vozPostVsl: assetUrl("/audio/whatsapp-post-vsl.wav"),
} as const
