import * as React from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useContext } from "react";
import AppContext from "./AppContext";
import { useInView } from "react-intersection-observer";
import { Fade } from "react-awesome-reveal";
import { useMediaQuery, Zoom } from "@mui/material";
import { useTheme } from "@emotion/react";
import newBadge from "../assets/new-badge.gif";
import { Box } from "@mui/material";

export default function AllModelsContainer() {
  const context = useContext(AppContext);
  const router = useRouter();
  const [checked, setChecked] = React.useState(false);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });
  React.useEffect(() => {
    setChecked(true);
  }, [inView]);

  const handleRestoreImage = () => {
    router.push("/restorePhoto");
    context.setFileUrl("");
    localStorage.setItem("path", "/restorePhoto");
  };

  const handleRemoveBG = () => {
    context.setFileUrl("");
    router.push("/backgroundRemoval");
    localStorage.setItem("path", "/backgroundRemoval");
  };
  const handleObjectRemove = () => {
    context.setFileUrl("");
    router.push("/removeObject");
    localStorage.setItem("path", "/object-remover");
  };
  const handleRoomDesign = () => {
    context.setFileUrl("");
    router.push("/aiHomeMakeover");
    localStorage.setItem("path", "/aiHomeMakeover");
  };
  const imageStyle = {
    borderRadius: "5px 5px 0px 0px",
    width: "100%",
    height: "100%",
  };

  const handleTextToVideo = () => {
    router.push("/textToVideo");
    context.setFileUrl("");
    localStorage.setItem("path", "/textToVideo");
  };

  return (
    <div className="modelContainer" ref={ref}>
      {/* <div style={{ textAlign: 'center', marginTop: '2em' }}>
        <h2>
          All Model's  are free for limited time
        </h2>
      </div> */}
      <div style={{ textAlign: "center", marginTop: "2em" }}>
        <p
          style={{
            fontSize: !matches && "1rem",
            marginBottom: !matches && "2rem",
          }}
          className="ribbonHeading"
        >
          <span className="ribbonHeading-content">
            {" "}
            All Model's are free for limited time
          </span>
        </p>
      </div>

      <div className="allCardContainer flex-container">
        {inView && (
          <Zoom
            in={checked}
            style={{ transitionDelay: checked ? "100ms" : "0ms" }}
          >
            <div
              className="card"
              style={{ position: "relative" }}
              onClick={handleTextToVideo}
            >
              <div className="ribbon right">
                <h6 style={{ fontSize: "28px" }}>Free</h6>
              </div>
              <div className="card-img">
                <Image
                  style={imageStyle}
                  src="/assets/text-to-video-banner.png"
                  alt="Picture of the author"
                  width={400}
                  height={300}
                />
              </div>
              <div className="card-info">
                <h2>Text to Video</h2>
                <br />
                <p>
                  Transform text into engaging videos instantly. Explore various
                  styles for dynamic and creative storytelling. Enhance your
                  content effortlessly with Text to Video!
                </p>
              </div>
            </div>
          </Zoom>
        )}

        {inView && (
          <Zoom
            in={checked}
            style={{ transitionDelay: checked ? "100ms" : "0ms" }}
          >
            <div
              className="card"
              style={{ position: "relative" }}
              onClick={handleRestoreImage}
            >
              <div className="ribbon right">
                <h6 style={{ fontSize: "28px" }}>Free</h6>
              </div>
              <div className="card-img">
                <Image
                  style={imageStyle}
                  src="/assets/girlImg1.jpg"
                  alt="Picture of the author"
                  width={400}
                  height={300}
                />
              </div>
              <div className="card-info">
                <h2>Restore Photo</h2>
                <br />
                <p>
                  Restore the former quality of your images by reviving faded
                  family photographs, vintage snapshots, and more through our
                  image restoration service.
                </p>
              </div>
            </div>
          </Zoom>
        )}
     
        {inView && matches && (
          <Zoom
            in={checked}
            style={{ transitionDelay: checked ? "200ms" : "0ms" }}
          >
            <div
              className="card"
              style={{ position: "relative" }}
              onClick={handleRemoveBG}
            >
              {/* <div className="ribbon">Free</div> */}
              <div className="ribbon right">
                <h6 style={{ fontSize: "28px" }}>Free</h6>
              </div>
              <div className="card-img ">
                <Image
                  style={imageStyle}
                  src="/assets/remove-background.jpg"
                  alt="Picture of the author"
                  width={400}
                  height={300}
                />
              </div>
              <div className="card-info">
                <h2>Background Removal</h2>
                <br />
                <p>
                  Effortlessly remove the background from any image using our
                  advanced background removal tool. <br />
                  <br />
                </p>
              </div>
            </div>
          </Zoom>
        )}
        {inView && (
          <Zoom
            in={checked}
            style={{ transitionDelay: checked ? "400ms" : "0ms" }}
          >
            <div
              className="card"
              style={{ position: "relative" }}
              onClick={handleObjectRemove}
            >
              <div className="ribbon right">
                <h6 style={{ fontSize: "28px" }}>Free</h6>
              </div>
              <div className="card-img">
                <Image
                  style={imageStyle}
                  src="/assets/models/remove-object-picfix-pic-landing-page.png"
                  alt="Picture of the author"
                  width={400}
                  height={300}
                />
              </div>
              <div className="card-info">
                <h2>Remove Objects</h2>
                <br />
                <p>
                  Effortlessly remove unwanted objects from your photos. Achieve
                  a clean, professional look with just a few clicks. Perfect for
                  creating flawless, polished images.{" "}
                </p>
              </div>
            </div>
          </Zoom>
        )}

        {inView && (
          <Zoom
            in={checked}
            style={{ transitionDelay: checked ? "500ms" : "0ms" }}
          >
            <div
              className="card"
              style={{ position: "relative" }}
              onClick={handleRoomDesign}
            >
              <div className="ribbon right">
                <h6 style={{ fontSize: "28px" }}>Free</h6>
              </div>
              <div className="card-img">
                <Image
                  style={imageStyle}
                  src="/assets/Dream-Room.jpg"
                  alt="Picture of the author"
                  width={400}
                  height={300}
                />
              </div>
              <div className="card-info">
                <h2>AI Home Makeover</h2>
                <br />
                <p>
                  Experience the future of home design with our AI-powered
                  solution. Transform your spaces effortlessly, adding beauty
                  and style to every corner of your home.
                </p>
              </div>
            </div>
          </Zoom>
        )}
      </div>
    </div>
  );
}
