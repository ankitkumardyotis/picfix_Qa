import Cookies from "js-cookie";
import { io } from "socket.io-client";


const URL = process.env.NEXT_PUBLIC_SERVICE_BASE_URL;

export const socket = io(URL, {
  autoConnect: false,
  extraHeaders: {
    authorization: `Bearer ${Cookies.get("access-token")}`
  }
});
