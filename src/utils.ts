import type { HomeAssistant } from "./types";

export function getState(hass: HomeAssistant, entityId?: string): string {
  if (!entityId) return "unknown";
  return hass?.states[entityId]?.state ?? "unknown";
}

export function callCoverService(
  hass: HomeAssistant,
  service: string,
  entityId: string,
): void {
  hass.callService("cover", service, { entity_id: entityId });
}
