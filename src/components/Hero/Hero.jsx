import { useEffect, useRef } from "react";

import signatureUrl from "../../images/signaturev2.svg?url";

export default function Hero() {
    return (
        <div
            className="relative min-h-screen w-full"
            style={{ background: "transparent", position: "relative", zIndex: 0 }}
        >

            <AnimatedSVG
                src={signatureUrl}
                fillColor="#ddd"
                penWidth={30}
                left="10%"
                top="20%"
                width={300}
                baseSpeed={260}
                gap={0.1}
            />
        </div>
    )
}

function AnimatedSVG({
    src,
    fillColor = "#fff",
    penWidth = 30,
    left = "10%",
    top = "20%",
    width = 420,
    baseSpeed = 280,
    gap = 0.12,
}) {
    const hostRef = useRef(null);

    useEffect(() => {
        const STYLE_ID = "handwrite-anim-style";
        if (!document.getElementById(STYLE_ID)) {
            const style = document.createElement("style");
            style.id = STYLE_ID;
            style.textContent = `@keyframes handwrite { to { stroke-dashoffset: 0; } }`;
            document.head.appendChild(style);
        }

        let cancelled = false;

        async function loadAndAnimate() {
            if (!src) return;
            let text = "";
            try {
                const res = await fetch(src);
                text = await res.text();
            } catch (e) {
                console.error("Failed to load SVG:", e);
                return;
            }
            if (cancelled || !hostRef.current) return;

            //text = text.replace(/fill:[^;"]*/g, 'fill:none');
            //text = text.replace(/fill="#[^"]*"/g, 'fill="none"');

            hostRef.current.innerHTML = text;
            const svg = hostRef.current.querySelector("svg");
            if (!svg) return;

            svg.style.width = "100%";
            svg.style.height = "auto";
            svg.setAttribute("preserveAspectRatio", "xMinYMin meet")

           const fillables = Array.from(svg.querySelectorAll("path, polygon, rect, ellipse, circle"));
           let strokePaths = Array.from(svg.querySelectorAll("path, polyline, line"));
           if (strokePaths.length === 0) {
            strokePaths = fillables.filter((el) => el.tagName.toLowerCase() === "path");
           }

           const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
           const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
           const maskId = `handwrite-mask-${Math.random().toString(36).slice(2)}`;
           mask.setAttribute("id", maskId);

           const maskBG = document.createElementNS("http://www.w3.org/2000/svg", "rect");
           maskBG.setAttribute("x", "0");
           maskBG.setAttribute("y", "0");
           const vb = (svg.getAttribute("viewBox") || "0 0 1000 1000").split(" ");
           maskBG.setAttribute("width", vb[2] || "1000");
           maskBG.setAttribute("height", vb[3] || "1000");
           maskBG.setAttribute("fill", "black");
           mask.appendChild(maskBG);

            let delay = 0;
            strokePaths.forEach((el) => {
                const tag = el.tagName.toLowerCase();
                const pen = document.createElementNS("http://www.w3.org/2000/svg", tag);
                // Copy geometry
                if (tag === "path") pen.setAttribute("d", el.getAttribute("d") || "");
                if (tag === "polyline") pen.setAttribute("points", el.getAttribute("points") || "");
                if (tag === "line") {
                    pen.setAttribute("x1", el.getAttribute("x1") || "0");
                    pen.setAttribute("y1", el.getAttribute("y1") || "0");
                    pen.setAttribute("x2", el.getAttribute("x2") || "0");
                    pen.setAttribute("y2", el.getAttribute("y2") || "0");
                }
                pen.setAttribute("fill", "none");
                pen.setAttribute("stroke", "white");
                pen.setAttribute("stroke-width", String(penWidth));
                pen.setAttribute("stroke-linecap", "round");
                pen.setAttribute("stroke-linejoin", "round");

                // Animate stroke to reveal
                const len = typeof el.getTotalLength === "function" ? el.getTotalLength() : 0;
                if (len > 0) {
                    pen.style.strokeDasharray = `${len}`;
                    pen.style.strokeDashoffset = `${len}`;
                    const dur = Math.max(0.3, len / baseSpeed);
                    pen.style.animation = `handwrite ${dur}s ${delay}s ease forwards`;
                    delay += gap;
                }
                mask.appendChild(pen);
            });
            
            defs.appendChild(mask);

            // Build a filled version of the art that will be revealed by the mask
            const filledGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            filledGroup.setAttribute("mask", `url(#${maskId})`);
            fillables.forEach((el) => {
                const tag = el.tagName.toLowerCase();
                const clone = document.createElementNS("http://www.w3.org/2000/svg", tag);
                // Copy geometry
                if (tag === "path") clone.setAttribute("d", el.getAttribute("d") || "");
                if (tag === "polygon") clone.setAttribute("points", el.getAttribute("points") || "");
                if (tag === "rect") {
                    clone.setAttribute("x", el.getAttribute("x") || "0");
                    clone.setAttribute("y", el.getAttribute("y") || "0");
                    clone.setAttribute("width", el.getAttribute("width") || "0");
                    clone.setAttribute("height", el.getAttribute("height") || "0");
                    if (el.getAttribute("rx")) clone.setAttribute("rx", el.getAttribute("rx"));
                    if (el.getAttribute("ry")) clone.setAttribute("ry", el.getAttribute("ry"));
                }
                if (tag === "ellipse" || tag === "circle") {
                    // ellipse: cx, cy, rx, ry; circle: cx, cy, r
                    ["cx","cy","rx","ry","r"].forEach((a) => {
                        if (el.getAttribute(a)) clone.setAttribute(a, el.getAttribute(a));
                    });
                }
                // Apply ink color
                clone.setAttribute("fill", fillColor);
                clone.setAttribute("stroke", fillColor);
                filledGroup.appendChild(clone);
            });

            // Replace original contents: <defs> then filled art
            while (svg.firstChild) svg.removeChild(svg.firstChild);
            svg.appendChild(defs);
            svg.appendChild(filledGroup);
        }

        loadAndAnimate();
        return () => {
            cancelled = true;
        };
    }, [src, fillColor, penWidth, baseSpeed, gap]);

    return (
        <div
            ref={hostRef}
            style={{
                position: "absolute",
                left,
                top,
                width,
                pointerEvents: "none",
                zIndex: 60,
                border: "1px solid red",
                transform: "translate(40%, 20%)"
            }}
        />
    );
}