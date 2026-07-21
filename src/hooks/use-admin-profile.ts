import { useQuery } from "@tanstack/react-query";

export type AdminProfile = {
  _id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  username?: string;
  profilePicture?: string;
};

type ProfileResponse = {
  success: boolean;
  message: string;
  data: AdminProfile;
};

export function useAdminProfile(token?: string) {
  return useQuery<AdminProfile>({
    queryKey: ["user-profile"],
    enabled: Boolean(token),
    staleTime: 60 * 1000,
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      if (!baseUrl) throw new Error("Backend API URL is not configured.");
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/user/profile`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const result = (await response.json().catch(() => null)) as ProfileResponse | null;
      if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.message || "Unable to load profile.");
      }
      return result.data;
    },
  });
}
