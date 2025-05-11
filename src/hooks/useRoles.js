import { useWallet } from "@/hooks/useWallet";
export function useRoles() {
  // simply proxy the booleans so existing imports still work
  const { loadingRoles, isVenue, isDoorman, isAttendee } = useWallet();
  return {
    loading: loadingRoles,
    isVenue,
    isDoorman,
    isAttendee,
  };
}
export default useRoles;
