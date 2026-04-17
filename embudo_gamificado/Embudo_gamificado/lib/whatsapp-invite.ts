/** Invitación al grupo donde se entrega la información completa (Fundador VIP). */
export const WHATSAPP_GROUP_INVITE_URL =
  "https://chat.whatsapp.com/FP0Or30apXT9d5NM2aBicY?mode=gi_t" as const

export function openWhatsAppGroupInvite() {
  if (typeof window === "undefined") return
  window.location.assign(WHATSAPP_GROUP_INVITE_URL)
}
