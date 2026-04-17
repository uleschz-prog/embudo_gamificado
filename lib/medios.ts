/**
 * Rutas de /public — edita solo aquí para cambiar qué archivo usa cada pantalla.
 *
 * NEXT_PUBLIC_ASSET_PREFIX: solo si la app vive bajo una subruta (ej. /app).
 */
function assetUrl(rutaAbsoluta: string): string {
  const base = (process.env.NEXT_PUBLIC_ASSET_PREFIX ?? "").replace(/\/$/, "")
  const path = rutaAbsoluta.startsWith("/") ? rutaAbsoluta : `/${rutaAbsoluta}`
  return base ? `${base}${path}` : path
}

export const medios = {
  /** Logo / icono pequeño (caja de comentarios “tu perfil”) */
  logo: assetUrl("/images/asesor-raiz.jpg"),

  /** Foto del contacto en WhatsApp (las dos conversaciones) */
  fotoAsesor: assetUrl("/images/asesor-raiz.jpg"),

  /** Foto del perfil en el reel (sidebar y cabecera del vídeo). Puede ser distinta del asesor. */
  fotoReel: assetUrl("/images/woman-balaclava.jpg"),

  /** Primer reel a pantalla completa (nombre con espacio → %20) */
  videoFeed1: assetUrl("/videos/Untitled%20Video_720p.mp4"),

  /** Video VSL del embudo (pantalla "archivo restringido") */
  videoVsl: assetUrl("/videos/manifiesto_raiz.mp4"),

  /** Tono en bucle antes de contestar la llamada */
  tonoLlamadaEntrante: assetUrl("/audio/incoming-ringtone.mp3"),

  /** Audio mientras la llamada está “activa” */
  tonoLlamadaActiva: assetUrl("/audio/ringtone.mp3"),

  /** Primera nota de voz del chat (patrón / clasificación) */
  vozMensaje1: assetUrl("/audio/whatsapp-message-1.wav"),

  /**
   * Nota de voz tras el VSL. Ahora mismo no tienes un segundo .wav dedicado en /public/audio;
   * sustituye esta ruta cuando subas p. ej. whatsapp-post-vsl.wav
   */
  vozPostVsl: assetUrl("/audio/tiktok-video-1.wav"),

  /** Avatares falsos en la lista de comentarios del reel */
  avatarCarlos: assetUrl("/images/avatar-carlos.jpg"),
  avatarAna: assetUrl("/images/avatar-ana.jpg"),
  avatarEmprendedor: assetUrl("/images/avatar-emprendedor.jpg"),
  avatarLucia: assetUrl("/images/avatar-lucia.jpg"),
  avatarMindset: assetUrl("/images/avatar-mindset.jpg"),
} as const
