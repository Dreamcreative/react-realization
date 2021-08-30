export const NoWork = 0;
// 最大的31 bit integer
export const Sync = 1073741823;
export const Batched = Sync - 1;
const UNIT_SIZE = 10;
const MAGIC_NUMBER_OFFSET = Batched - 1;
export function msToExpirationTime(ms) {
  return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0)
}