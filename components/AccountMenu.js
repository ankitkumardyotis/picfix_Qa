import * as React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import { useRouter } from "next/router";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import ColorizeIcon from "@mui/icons-material/Colorize";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import TransformIcon from "@mui/icons-material/Transform";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import BrushIcon from "@mui/icons-material/Brush";
import WidgetsIcon from "@mui/icons-material/Widgets";
import { Icon } from "@mui/material";
import { useContext } from "react";
import AppContext from "./AppContext";
import { Logout, PriceCheck } from "@mui/icons-material";
import { signOut, useSession } from "next-auth/react";
import LoginIcon from "@mui/icons-material/Login";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import Image from "next/image";
import newBadge from "../assets/new-badge.gif";
import axios from "axios";
import Cookies from "js-cookie";
import { ImageSearch } from "@mui/icons-material";

export default function AccountMenu() {
  // logout
  const [refresh, setRefresh] = useState(false);
  const context = useContext(AppContext);
  const { data: session } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState("");
  const open = Boolean(anchorEl);
  const [plan, setPlan] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (event) => {
    setAnchorEl(null);
  };
  React.useEffect(() => {
    fetchUserPlan();
  }, [session]);
  React.useEffect(() => { }, [plan]);

  const theme = useTheme();

  React.useEffect(() => {
    setInterval(() => setRefresh(!refresh), 2000);
  }, []);

  const fetchUserPlan = async () => {
    try {
      const response = await fetch(`/api/getPlan?userId=${session?.user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch plan data");
      }
      const { plan } = await response.json();
      setPlan(plan);
      context.setCreditPoints(plan.remainingPoints);
    } catch (error) {
      console.error("Error fetching plan data:", error);
    }
  };

  const handleJWTlogout = async () => {
    const response = await axios.get("/api/jwt/logout");
    if (response.status === 200) {
      Cookies.remove("access-token");
      Cookies.remove("refresh-token");
    }
  };

  return (
    <React.Fragment>
      <div
        onClick={handleClick}
        style={{ cursor: "pointer", position: "relative" }}
      >
        {session ? (
          <div>
            <div
              style={{
                paddingLeft: ".1em",
                paddingRight: ".1em",
                backgroundColor: "teal",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "5px",
                position: "absolute",
                right: "0",
                bottom: "0",
                border: "2px solid white",
              }}
            >
              <p style={{ color: "white", fontSize: ".6em", margin: 0, textAlign: "center" }}>
                {context.creditPoints}
              </p>
              {context.dailyUsage && (
                <p style={{ color: "white", fontSize: ".5em", margin: 0, textAlign: "center" }}>
                  {context.dailyUsage.remainingCredits}/{context.dailyUsage.dailyLimit}
                </p>
              )}
            </div>
            <img
              style={{
                width: "35px",
                height: "35px",
                marginRight: "10px",
                borderRadius: "50%",
                border: "1px solid teal",
              }}
              src={session.user.image}
              referrerPolicy="no-referrer"
              alt="user image"
            />{" "}
          </div>
        ) : (
          <Icon
            size="large"
            // sx={{ pr: 8 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            sx={{ cursor: "pointer" }}
            fontSize="large"
          // cursor="pointer"
          >
            <WidgetsIcon fontSize="large" />
            {/* < Avatar alt={session ? session?.user.name : "jhbhb"} src={session && session?.user.image} /> */}
          </Icon>
        )}
      </div>
      <Menu
        autoFocus={false}
        disableScrollLock={true}
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            mt: 1.5,
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            border: "1px solid rgba(0,0,0,0.08)",
            backgroundColor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            // Consistent item styles
            "& .MuiMenuItem-root": {
              // px: 2,
              // py: 1.25,
              gap: 1.5,
              fontSize: "13px",
              fontWeight: 500,
              color: "#333",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            },
            "& .MuiDivider-root": {
              my: 0.5,
            },
            // Icon pill style
            "& .MuiMenuItem-root .MuiListItemIcon-root": {
              minWidth: 0,
              mr: 1.5,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              backgroundColor: "rgba(102,126,234,0.08)",
              color: "#667eea",
            },
            // Hover effects
            "& .MuiMenuItem-root:hover": {
              backgroundColor: "rgba(102,126,234,0.06)",
              color: "#ffa726",
            },
            "& .MuiMenuItem-root:hover .MuiListItemIcon-root": {
              backgroundColor: "rgba(102,126,234,0.12)",
              color: "#ffa726",
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "rgba(255,255,255,0.95)",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* <MenuItem onClick={handlePaymentContainer} >
                    <UpgradeIcon fontSize="large" />  Buy Credits
                </MenuItem> */}
        {/* <Avatar /> */}

        {session && (
          <>
            {" "}
            <MenuItem
              onClick={async () => {
                // if (!plan) {
                //     router.push("/price")
                //     context.setFileUrl("")
                //     // localStorage.setItem("path", "/price")
                //     return
                // }
                router.push("/dashboard");
              }}
            >
              {session && (
                <img
                  style={{
                    width: "35px",
                    height: "35px",
                    marginRight: "10px",
                    borderRadius: "50%",
                  }}
                  src={session.user.image}
                  alt={session.user.name}
                />
              )}{" "}
              Dashboard
            </MenuItem>
            <Divider />
          </>
        )}


        <MenuItem
          onClick={() => {
            context.setFileUrl("");
            router.push("/ai-image-editor");
            localStorage.setItem("path", "/ai-image-editor");
            // context.setFileUrl('')
          }}
        >
          <ListItemIcon>
            <BrushIcon fontSize="small" />
          </ListItemIcon>
          AI Studio
        </MenuItem>
        <MenuItem
          onClick={() => {
            context.setFileUrl("");
            router.push("/gallery");
            localStorage.setItem("path", "/gallery");
          }}
        >
          <ListItemIcon>
            <ImageSearch fontSize="small" />
          </ListItemIcon>
          Gallery
        </MenuItem>
        <MenuItem
          onClick={() => {
            context.setFileUrl("");
            router.push("/pricing"), localStorage.setItem("path", "/pricing");
            // context.setFileUrl('')
          }}
        >
          <ListItemIcon>
            <PriceCheck fontSize="small" />
          </ListItemIcon>
          Pricing
        </MenuItem>
        <MenuItem
          onClick={() => {
            context.setFileUrl("");
            router.push("/blog"), localStorage.setItem("path", "/blog");
            // context.setFileUrl('')
          }}
        >
          <ListItemIcon>
            <PriceCheck fontSize="small" />
          </ListItemIcon>
          Blog
        </MenuItem>

        {!session && (
          <>
            {" "}
            <Divider />
            <MenuItem onClick={() => router.push("/login")}>
              <ListItemIcon>
                <LoginIcon fontSize="small" />
              </ListItemIcon>
              Login
            </MenuItem>
          </>
        )}
        {session && (
          <>
            {" "}
            <Divider />
            <MenuItem
              onClick={async () => {
                await handleJWTlogout();
                signOut("/");
                router.push("/");
                localStorage.clear();
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </>
        )}
      </Menu>
    </React.Fragment>
  );
}
