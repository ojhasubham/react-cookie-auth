import decode from "jwt-decode";
import cookies from "js-cookie";

export const getAuthUserData = () => {
  const data = cookies.get("authUserData");
  return data ? JSON.parse(data) : null;
};

export const setAuthUserData = data => {
  cookies.set("authUserData", JSON.stringify(data));
  cookies.set("accessToken", data.accessToken);
};

export const removeAuthUserData = () => {
  cookies.remove("authUserData");
  cookies.remove("accessToken");
};

export const checkTokenExpire = token => {
  try {
    const { exp } = decode(token);
    const currentTime = new Date().getTime() / 1000;

    if (currentTime > exp) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};
