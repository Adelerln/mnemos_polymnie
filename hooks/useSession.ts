import { AuthContext } from "@/components/AuthProvider";
import { useContext } from "react";

export const useSession = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useSession must be used within an AuthProvider.");
  }

  return context;
};
