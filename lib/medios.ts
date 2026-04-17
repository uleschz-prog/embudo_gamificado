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
  fotoAsesor: assetUrl("/images/asesor-raiz.png"),
  videoFeed1: assetUrl("/videos/feed-1.mp4"),
  notificacion: assetUrl("/audio/notificacion.mp3"),
  vozMensaje1: assetUrl("/audio/voz-mensaje-1.wav"),
  vozPostVsl: assetUrl("/audio/voz-post-vsl.wav"),
} as const
