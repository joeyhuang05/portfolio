import { useEffect, useRef } from "react";

import signatureUrl from "../../images/signature.svg?url";

export default function Hero() {
    return (
        <div
            className="relative min-h-screen w-full"
            style={{ background: "transparent", position: "relative", zIndex: 0 }}
        >

            <AnimatedSVG
                src={signatureUrl}
                color="#ddd"
                strokeWidth={4}
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
    color = "#fff",
    strokeWidth = 4,
    left = "50%",
    top = "50%",
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

            const paths = svg.querySelectorAll("path");
            paths.forEach((path) => {
                path.setAttribute("stroke", color);
                path.setAttribute("stroke-width", strokeWidth);
                path.setAttribute("stroke-linecap", "round");
                path.setAttribute("stroke-linejoin", "round");
            });
            
            console.debug("Paths found:", paths.length);
            if (paths.length === 0) return;

            let delay = 0;
            paths.forEach((p) => {
                const len = p.getTotalLength();
                p.style.strokeDasharray = `${len}`;
                p.style.strokeDashoffset = `${len}`;
                const dur = Math.max(0.3, len / baseSpeed);
                p.style.animation = `handwrite ${dur}s ${delay}s ease forwards`;
                delay += gap;
            });
        }

        loadAndAnimate();
        return () => {
            cancelled = true;
        };
    }, [src, color, strokeWidth, baseSpeed, gap]);

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