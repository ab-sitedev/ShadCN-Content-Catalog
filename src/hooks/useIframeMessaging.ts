import { useEffect } from "react";

interface IframeMessagingProps {
  dependencies: any[];
}

export function useIframeMessaging({ dependencies }: IframeMessagingProps) {
  useEffect(() => {
    const sendHeight = () => {
      if (window.parent !== window) {
        const container = document.getElementById("app-container");
        if (container) {
          const height = container.offsetHeight + 64;
          window.parent.postMessage(
            {
              type: "resizeIframe",
              height: height,
            },
            "*"
          );
        }
      }
    };

    sendHeight();

    window.addEventListener("resize", sendHeight);

    const container = document.getElementById("app-container");
    const resizeObserver = new ResizeObserver(sendHeight);
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      window.removeEventListener("resize", sendHeight);
      resizeObserver.disconnect();
    };
  }, dependencies);
}
