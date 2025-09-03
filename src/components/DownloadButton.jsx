// DownloadButton.jsx
import React, { useState } from "react";
import { Panel, useReactFlow } from "@xyflow/react";
import { toPng } from "html-to-image";

export default function DownloadButton({ flowRef }) {
    const { getNodes, getNodesBounds } = useReactFlow();
    const [hover, setHover] = useState(false);

    // helper: copy computed styles from source -> target
    const copyComputedStyle = (source, target) => {
        const s = window.getComputedStyle(source);
        let cssText = "";
        for (let i = 0; i < s.length; i++) {
            const prop = s[i];
            try {
                cssText += `${prop}: ${s.getPropertyValue(prop)};`;
            } catch (e) {
                // ignore properties that throw
            }
        }
        target.style.cssText = cssText;
    };

    const copyStylesRecursively = (src, dst) => {
        try {
            copyComputedStyle(src, dst);
        } catch (e) {}
        const srcChildren = src.children || [];
        const dstChildren = dst.children || [];
        const len = Math.min(srcChildren.length, dstChildren.length);
        for (let i = 0; i < len; i++) {
            copyStylesRecursively(srcChildren[i], dstChildren[i]);
        }
    };

    // helper: convert <img src> to dataURL (attempt crossOrigin anonymous)
    const imgToDataUrl = (src) =>
        new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    const data = canvas.toDataURL("image/png");
                    resolve({ ok: true, data });
                } catch (err) {
                    console.warn("imgToDataUrl draw error:", err);
                    resolve({ ok: false });
                }
            };
            img.onerror = (e) => {
                console.warn("imgToDataUrl load error for", src, e);
                resolve({ ok: false });
            };
            img.src = src;
            // if cached and complete, trigger onload manually
            if (img.complete) {
                // tiny delay to ensure onload runs
                setTimeout(() => {
                    try {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.naturalWidth || img.width;
                        canvas.height = img.naturalHeight || img.height;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0);
                        resolve({ ok: true, data: canvas.toDataURL("image/png") });
                    } catch {
                        resolve({ ok: false });
                    }
                }, 10);
            }
        });

    // inline images/backgrounds in cloned subtree (best-effort)
    const inlineImagesInClone = async (originalRoot, cloneRoot) => {
        try {
            // 1) <img> tags
            const origImgs = originalRoot.querySelectorAll("img");
            const clonedImgs = cloneRoot.querySelectorAll("img");
            for (let i = 0; i < Math.min(origImgs.length, clonedImgs.length); i++) {
                const o = origImgs[i];
                const c = clonedImgs[i];
                const src = o.getAttribute("src") || "";
                if (!src) continue;
                const res = await imgToDataUrl(src);
                if (res.ok) {
                    c.setAttribute("src", res.data);
                } else {
                    // can't inline (likely CORS) — keep original src but warn
                    console.warn("Couldn't inline image (maybe CORS):", src);
                }
            }

            // 2) background-image in computed styles
            const allOrig = originalRoot.querySelectorAll("*");
            const allCloned = cloneRoot.querySelectorAll("*");
            for (let i = 0; i < Math.min(allOrig.length, allCloned.length); i++) {
                const oEl = allOrig[i];
                const cEl = allCloned[i];
                try {
                    const s = window.getComputedStyle(oEl);
                    const bg = s.getPropertyValue("background-image");
                    if (bg && bg !== "none" && bg.includes("url(")) {
                        // extract URL
                        const urlMatch = bg.match(/url\((['"]?)(.*?)\1\)/);
                        if (urlMatch && urlMatch[2]) {
                            const url = urlMatch[2];
                            const res = await imgToDataUrl(url);
                            if (res.ok) {
                                cEl.style.backgroundImage = `url("${res.data}")`;
                            } else {
                                console.warn("Couldn't inline background-image (maybe CORS):", url);
                            }
                        }
                    }
                } catch (e) {
                    // ignore
                }
            }

            // 3) inline <image> inside SVG (xlink:href / href)
            const origSvgImages = originalRoot.querySelectorAll("svg image");
            const clonedSvgImages = cloneRoot.querySelectorAll("svg image");
            for (let i = 0; i < Math.min(origSvgImages.length, clonedSvgImages.length); i++) {
                const o = origSvgImages[i];
                const c = clonedSvgImages[i];
                const href = o.getAttribute("href") || o.getAttributeNS("http://www.w3.org/1999/xlink", "href");
                if (!href) continue;
                const res = await imgToDataUrl(href);
                if (res.ok) {
                    c.setAttribute("href", res.data);
                } else {
                    console.warn("Couldn't inline svg <image> (maybe CORS):", href);
                }
            }
        } catch (err) {
            console.warn("inlineImagesInClone error:", err);
        }
    };

    const exportChart = async () => {
        try {
            const nodes = getNodes();
            if (!nodes || nodes.length === 0) {
                console.warn("No nodes to export");
                alert("هیچ نودی برای صدور وجود ندارد.");
                return;
            }

            const bounds = getNodesBounds(nodes);
            if (!bounds) {
                console.warn("bounds empty");
                alert("خطا: محدوده نودها نامشخص است.");
                return;
            }

            const viewportEl =
                flowRef?.current || document.querySelector(".react-flow__viewport");
            if (!viewportEl) {
                console.warn("React Flow viewport not found");
                alert("خطا: پنجره‌ی React Flow پیدا نشد.");
                return;
            }

            // پیدا کردن renderer (جایی که نودها هستند)
            const rendererEl =
                viewportEl.querySelector(".react-flow__renderer") ||
                viewportEl.querySelector(".react-flow__pane") ||
                viewportEl;

            console.log("rendererEl found:", !!rendererEl, rendererEl);
            console.log("bounds:", bounds);

            // A4 Landscape (96 DPI)
            const a4Width = 1123;
            const a4Height = 794;

            // scale جدا برای X و Y (فیت کامل)
            const scaleX = a4Width / bounds.width;
            const scaleY = a4Height / bounds.height;

            // کلون
            const cloned = rendererEl.cloneNode(true);

            // copy computed styles recursively
            try {
                copyStylesRecursively(rendererEl, cloned);
            } catch (e) {
                console.warn("copyStylesRecursively failed:", e);
            }

            // inline images/backgrounds (best-effort)
            await inlineImagesInClone(rendererEl, cloned);

            // wrapper offscreen (A4 size)
            const wrapper = document.createElement("div");
            wrapper.style.position = "absolute";
            wrapper.style.top = "-9999px";
            wrapper.style.left = "-9999px";
            wrapper.style.width = `${a4Width}px`;
            wrapper.style.height = `${a4Height}px`;
            wrapper.style.overflow = "hidden";
            wrapper.style.background = "#ffffff";

            const content = document.createElement("div");
            content.style.position = "relative";
            content.style.width = `${a4Width}px`;
            content.style.height = `${a4Height}px`;
            content.style.overflow = "hidden";
            content.style.background = "#ffffff";

            // place cloned element absolutely, apply transform:
            // translate by -bounds.x/-bounds.y (in original units), then scale
            const translateX = -bounds.x;
            const translateY = -bounds.y;
            cloned.style.position = "absolute";
            cloned.style.transformOrigin = "top left";
            // set width/height so repaint correct
            cloned.style.width = `${bounds.width}px`;
            cloned.style.height = `${bounds.height}px`;
            cloned.style.left = "0";
            cloned.style.top = "0";
            // apply translate (in original units) then scale to A4
            cloned.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

            content.appendChild(cloned);
            wrapper.appendChild(content);
            document.body.appendChild(wrapper);

            // wait for fonts and a short repaint
            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }
            await new Promise((r) => setTimeout(r, 120));

            // generate image (A4)
            const dataUrl = await toPng(wrapper, {
                width: a4Width,
                height: a4Height,
                cacheBust: true,
                backgroundColor: "#ffffff",
            });

            // cleanup
            document.body.removeChild(wrapper);

            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = "chart-a4-landscape.png";
            a.click();

            console.log("export finished");
        } catch (err) {
            console.error("Error generating image:", err);
            if (err && /tainted/i.test(String(err))) {
                alert(
                    "خطا: عملیات ناموفق است چون تصاویر cross-origin بدون CORS باعث آلودگی canvas شده‌اند. برای رفع: تصاویر را با crossOrigin='anonymous' بارگذاری کن یا از سرور/پراکسی با header مناسب استفاده کن."
                );
            } else {
                alert("خطا در تولید تصویر — برای جزئیات کنسول را بررسی کنید.");
            }
        }
    };

    return (
        <Panel position="top-right">
            <button
                onClick={exportChart}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "9999px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    color: "white",
                    background: hover
                        ? "linear-gradient(90deg, #4f46e5, #9333ea)"
                        : "linear-gradient(90deg, #2563eb, #4f46e5)",
                    boxShadow: hover
                        ? "0 6px 15px rgba(79,70,229,0.5)"
                        : "0 4px 10px rgba(37,99,235,0.4)",
                    transform: hover ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.3s ease-in-out",
                }}
            >
                Download A4 PNG
            </button>
        </Panel>
    );
}
