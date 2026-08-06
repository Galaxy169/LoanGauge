import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAccessToken, setCredentials, logout } from '@/store/authSlice';
import { useRefreshTokenMutation } from '@/services/authApi';
import { getJwtExpiryMs } from '@/utils/jwt';

// How long before the access token's real expiry we proactively refresh it.
// Keeps normal requests from ever seeing a 401 in the first place. The
// reactive 401 -> refresh flow in services/api.js still exists as a fallback
// (e.g. if the device was asleep and this timer got skipped).
const REFRESH_BUFFER_MS = 60 * 1000;

// Renders nothing — mounted once near the app root purely to keep the
// session alive (or end it) in the background, independent of whatever page
// the user happens to be looking at. Without this, an idle tab with an
// expired access token and no in-flight requests would never notice the
// token had expired.
export default function TokenRefreshManager() {
  const dispatch = useDispatch();
  const accessToken = useSelector(selectAccessToken);
  const [refreshToken] = useRefreshTokenMutation();
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!accessToken) return undefined;

    const expiryMs = getJwtExpiryMs(accessToken);
    // If the token can't be decoded, don't guess at a schedule — the
    // reactive 401 flow in api.js still covers this token.
    if (!expiryMs) return undefined;

    const delay = Math.max(expiryMs - Date.now() - REFRESH_BUFFER_MS, 0);

    timerRef.current = setTimeout(async () => {
      try {
        const result = await refreshToken().unwrap();
        dispatch(setCredentials({
          accessToken: result.data.accessToken,
          user: result.data.user,
        }));
      } catch {
        // The httpOnly refresh cookie is missing, expired, or revoked —
        // there's nothing left to try. Log the user out instead of leaving
        // them sitting on a session that will 401 on the next request.
        dispatch(logout());
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [accessToken, dispatch, refreshToken]);

  return null;
}
