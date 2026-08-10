import { PeriodicData } from "@/data/elementData";

export type ElementDetail = (typeof PeriodicData)[number];

const detailsById = new Map(PeriodicData.map((d) => [d.id, d]));

/** Look up the rich detail record (mass, config, discovery, etc.) for a grid element by id. */
export function getElementDetail(id: number): ElementDetail | undefined {
  return detailsById.get(id);
}

const ROOM_TEMP_K = 298.15;

export function getStateAtRoomTemp(
  detail: ElementDetail | undefined,
): "Solid" | "Liquid" | "Gas" | "Unknown" {
  if (
    !detail ||
    !Number.isFinite(detail.meltingPoint) ||
    !Number.isFinite(detail.boilingPoint)
  ) {
    return "Unknown";
  }
  if (ROOM_TEMP_K < detail.meltingPoint) return "Solid";
  if (ROOM_TEMP_K < detail.boilingPoint) return "Liquid";
  return "Gas";
}


