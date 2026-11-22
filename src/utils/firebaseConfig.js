export function isFirebaseConfigReady(config) {
  return Object.values(config).every((value) => (
    typeof value === 'string' && value.trim() && !/^your[-_]/i.test(value.trim())
  ));
}
