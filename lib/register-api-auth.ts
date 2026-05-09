import { bindAuthTokenGetter } from "./api-client";
import { useAuthStore } from "./auth-store";

bindAuthTokenGetter(() => useAuthStore.getState().token);
