import { useQueryClient } from "@tanstack/react-query";
import { 
  useAdminLogin as useGeneratedAdminLogin, 
  useGetAuthUser as useGeneratedGetAuthUser,
  useAdminLogout as useGeneratedAdminLogout,
  getGetAuthUserQueryKey
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "./use-toast";

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useGeneratedGetAuthUser({
    query: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    }
  });

  const login = useGeneratedAdminLogin({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetAuthUserQueryKey(), data.user);
        toast({ title: "Welcome back", description: "Successfully logged in." });
        setLocation("/admin/dashboard");
      },
      onError: () => {
        toast({ 
          title: "Login failed", 
          description: "Invalid credentials. Please try again.",
          variant: "destructive" 
        });
      }
    }
  });

  const logout = useGeneratedAdminLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(getGetAuthUserQueryKey(), null);
        toast({ title: "Logged out", description: "You have been logged out." });
        setLocation("/admin/login");
      }
    }
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    login,
    logout
  };
}
