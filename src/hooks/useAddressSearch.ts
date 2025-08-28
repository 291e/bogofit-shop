import { useCallback } from "react";

// 다음 주소 API 타입 정의
interface DaumPostcodeData {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: "R" | "J" | string;
}

interface AddressResult {
  zipCode: string;
  address: string;
}

declare global {
  interface Window {
    daum?: unknown;
  }
}

function ensureDaumScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).daum?.Postcode) return resolve();

    let script = document.getElementById("daum-postcode-script") as
      | HTMLScriptElement
      | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "daum-postcode-script";
      script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const start = Date.now();
    const timer = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).daum?.Postcode) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - start > 6000) {
        clearInterval(timer);
        reject(new Error("postcode script timeout"));
      }
    }, 50);
  });
}

export const useAddressSearch = () => {
  const openAddressSearch = useCallback(
    async (onComplete: (result: AddressResult) => void) => {
      try {
        await ensureDaumScript();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const DaumPostcode = (window as any).daum?.Postcode as
          | (new (opts: { oncomplete: (data: DaumPostcodeData) => void }) => {
              embed?: (el: HTMLElement) => void;
              open: () => void;
            })
          | undefined;
        if (!DaumPostcode) throw new Error("postcode not available");

        // Create centered overlay (simple, no event trapping to keep picker interactive)
        const existing = document.getElementById("daum-postcode-overlay");
        if (existing) existing.remove();

        const overlay = document.createElement("div");
        overlay.id = "daum-postcode-overlay";
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(0,0,0,0.35)";
        overlay.style.zIndex = "99999";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";

        const container = document.createElement("div");
        container.style.width = "min(100vw, 640px)";
        container.style.height = "520px";
        container.style.background = "#fff";
        container.style.borderRadius = "12px";
        container.style.overflow = "hidden";
        container.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
        container.style.position = "relative";

        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.textContent = "×";
        closeBtn.setAttribute("aria-label", "Close");
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "8px";
        closeBtn.style.right = "12px";
        closeBtn.style.fontSize = "24px";
        closeBtn.style.lineHeight = "24px";
        closeBtn.style.background = "transparent";
        closeBtn.style.border = "none";
        closeBtn.style.cursor = "pointer";
        closeBtn.onclick = () => {
          try {
            document.body.removeChild(overlay);
          } catch {
            // ignore
          }
        };

        overlay.appendChild(container);
        container.appendChild(closeBtn);
        document.body.appendChild(overlay);

        const instance = new DaumPostcode({
          oncomplete: function (data: DaumPostcodeData) {
            const addr = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
            onComplete({ zipCode: data.zonecode, address: addr });
            try {
              document.body.removeChild(overlay);
            } catch {
              // ignore
            }
          },
        });

        if (typeof instance.embed === "function") {
          instance.embed(container);
        } else {
          // fallback to popup
          document.body.removeChild(overlay);
          instance.open();
        }
      } catch (e) {
        console.error("openAddressSearch failed", e);
        alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      }
    },
    []
  );

  return { openAddressSearch };
};