import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

/**
 * Landing page for Google OAuth success.
 * The backend redirects here with ?token=<accessToken>.
 * We read it, store it via AuthContext, then navigate to the dashboard.
 */
function OAuthSuccess() {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            login(token);        // stores in localStorage + updates context
            navigate("/", { replace: true });
        } else {
            navigate("/login", { replace: true });
        }
    }, []); // run once on mount

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <p style={{ color: "#888", fontSize: "1.2rem" }}>Signing you in with Google…</p>
        </div>
    );
}

export default OAuthSuccess;
