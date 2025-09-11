import { useAuthCheckQuery } from "@/lib/api";
import { setAuth } from "@/store/appSlice";
import { useDispatch } from "react-redux";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: user, isLoading } = useAuthCheckQuery();
    const dispatch = useDispatch();
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (user && user.user.id) {
        dispatch(setAuth({
            loggedIn: true,
            username: user.user.username,
            id: user.user.id,
        }));
    }
    
    return <>{children}</>;
}