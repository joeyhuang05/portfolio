import { useEffect, useRef } from "react";

import signatureUrl from "../../images/mask.svg?url";
import introUrl from "../../images/intro.svg?url";

export default function Hero({
    fillColor = "#ddd",
    penWidth = 8,
    introPenWidth = 6,
    width = 300,
    baseSpeed = 150,
    gap = 0.3,
    durationMs = 2400,
    replayKey,
}) {

    return (
        <div
            className="relative min-h-screen w-full"
            style={{ background: "transparent", position: "relative", zIndex: 0 }}
        >

            <AnimatedSVG
                src={signatureUrl}
                fillColor={fillColor}
                penWidth={penWidth}
                left="10%"
                top="20%"
                width={width}
                baseSpeed={baseSpeed}
                gap={gap}
                durationMs={durationMs}
                replayKey={replayKey}
            />
            <AnimatedSVG
                src={introUrl}
                fillColor={fillColor}
                penWidth={introPenWidth}
                left="60%"
                top="20%"
                width={width}
                baseSpeed={baseSpeed}
                gap={gap}
                durationMs={durationMs}
                replayKey={replayKey}
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
    durationMs = 2400,
    replayKey,
}) {
    const hostRef = useRef(null);
    const penRef = useRef(null);

    useEffect(() => {
        const STYLE_ID = "handwrite-anim-style";
        if (!document.getElementById(STYLE_ID)) {
            const style = document.createElement("style");
            style.id = STYLE_ID;
            style.textContent = `@keyframes handwrite { to { stroke-dashoffset: 0; } }`;
            document.head.appendChild(style);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadAndAnimate() {
            if (!src || !hostRef.current) return;

            let text = "";
            try {
                const res = await fetch(src);
                text = await res.text();
            } catch (e) {
                console.error("failed to load svg: ", e);
                return;
            }
            if (cancelled || !hostRef.current) return;

            hostRef.current.innerHTML = text;
            const svg = hostRef.current.querySelector("svg");
            if (!svg) return;

            svg.style.width = "100%";
            svg.style.height = "auto";
            svg.setAttribute("preserveAspectRatio", "xMinYMin meet");

            let strokeEls = Array.from(svg.querySelectorAll("path, polyline, line"));

            if (strokeEls.length) {
                let delay = 0;
                strokeEls.forEach((el) => {
                    el.style.fill = "none";
                    el.style.stroke = fillColor;
                    el.style.strokeWidth = String(penWidth);
                    el.style.strokeLinecap = "round";
                    el.style.strokeLinejoin = "round";

                    el.setAttribute("fill", "none");
                    el.setAttribute("stroke", fillColor);
                    el.setAttribute("stroke-width", String(penWidth));
                    el.setAttribute("stroke-linecap", "round");
                    el.setAttribute("stroke-linejoin", "round");

                    el.setAttribute("vector-effect", "non-scaling-stroke");

                    const len = typeof el.getTotalLength === "function" ? el.getTotalLength() : 0;
                    if (len > 0) {
                        el.style.strokeDasharray = `${len}`;
                        el.style.strokeDashoffset = `${len}`;
                        const dur = Math.max(0.3, len / baseSpeed);
                        el.style.animation = `handwrite ${dur}s ${delay}s ease forwards`;
                        delay += gap;
                    }
                });
                return;
            }

            const fillables = Array.from(svg.querySelectorAll("path, polygon, rect, ellipse, circle"));
            if (!fillables.length) return;

            const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
            const maskId = `handwrite-mask-${Math.random().toString(36).slice(2)}`;
            mask.setAttribute("id", maskId);
            mask.setAttribute("maskUnits", "userSpaceOnUse");
            mask.setAttribute("maskContentUnits", "userSpaceOnUse");

            const maskBG = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            const vb = (svg.getAttribute("viewBox") || "0 0 1000 1000").split(" ");
            maskBG.setAttribute("x", "0");
            maskBG.setAttribute("y", "0");
            maskBG.setAttribute("width", vb[2] || "1000");
            maskBG.setAttribute("height", vb[3] || "1000");
            maskBG.setAttribute("fill", "black");
            mask.appendChild(maskBG);

            let delay = 0;
            fillables.forEach((el) => {
                const tag = el.tagName.toLowerCase();
                const pen = document.createElementNS("http://www.w3.org/2000/svg", "path");
                const d = tag === "path" ? (el.getAttribute("d") || "") : "";
                if (d) pen.setAttribute("d", d);

                pen.setAttribute("fill", "none");
                pen.setAttribute("stroke", "white");
                pen.setAttribute("stroke-width", String(penWidth));
                pen.setAttribute("stroke-linecap", "round");
                pen.setAttribute("stroke-linejoin", "round");

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

            const revealed = document.createElementNS("http://www.w3.org/2000/svg", "g");
            revealed.setAttribute("mask", `url(#${maskId})`);
            fillables.forEach((el) => {
                const tag = el.tagName.toLowerCase();
                const clone = document.createElementNS("http://www.w3.org/2000/svg", tag);

                if (tag === "path") clone.setAttribute("d", el.getAttribute("d") || "");
                if (tag === "polygon") clone.setAttribute("points", el.getAttribute("points") || "");
                if (tag === "rect") {
                    ["x", "y", "width", "height", "rx", "ry"].forEach(a => {
                        const v = el.getAttribute(a);
                        if (v != null) clone.setAttribute(a, v);
                    });
                }
                if (tag === "ellipse" || tag === "circle") {
                    ["cx", "cy", "rx", "ry", "r"].forEach(a => {
                        const v = el.getAttribute(a);
                        if (v != null) clone.setAttribute(a, v);
                    });
                }

                clone.setAttribute("fill", fillColor);
                clone.setAttribute("stroke", fillColor);
                revealed.appendChild(clone);
            });

            while (svg.firstChild) svg.removeChild(svg.firstChild);
            svg.appendChild(defs);
            svg.appendChild(revealed);
        }

        loadAndAnimate();
        return () => { cancelled = true };
    }, [src, fillColor, penWidth, baseSpeed, gap, durationMs, replayKey]);

    return (
        <div
            ref={hostRef}
            style={{
                position: "absolute",
                left,
                top,
                width,
                pointerEvents: "none",
                // border: "1px solid red",
                transform: "translate(40%, 20%)"
            }}
        />
    );
}