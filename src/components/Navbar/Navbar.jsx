import { useEffect, useRef, useState } from "react";
import "./Navbar.css"

const BG_OPTIONS = [
    { key: "sunrise", label: "Sunrise", swatch: "#DCE8F9", src: "/images/sunrise.png"},
    { key: "midday", label: "Day", swatch: "#A8D9D1", src: "/images/midday.png"},
    { key: "sunset", label: "Sunset", swatch: "#9D6BC9", src: "/images/sunset.png" },
    { key: "midnight", label: "Night", swatch: "#383838", src: "/images/midnight.png"}
]

export function Navbar({ brand = "j. huang", value, onSelect, options = BG_OPTIONS}) {
    const [open, setOpen] = useState(false);    /* tracks if dropdown is open */
    const [spinning, setSpinning] = useState(false)
    const btnRef = useRef(null);
    const panelRef = useRef(null);
    const [panelW, setPanelW] = useState(null)
    const active = options.find(o => o.key === value) || options[0];

    useEffect(() => {
        function measure() {
            if (btnRef.current) setPanelW(btnRef.current.offsetWidth);
        }
        if (open) measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [open]);

    useEffect(() => {
        /* close dropdown on click outside of button/panel */
        function onDocClick(e) {
            if (!open) return;
            const t = e.target;
            if (panelRef.current?.contains(t) || btnRef.current?.contains(t)) return;
            setOpen(false);
        }
        function onKey(e) { if (e.key === "Escape") setOpen(false); }
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    function ColorWheelIcon({ className = "w-7 h-7"}) {
        const mask = "radial-gradient(circle at center, black 60%, transparent 61%)";
        return (
            <div
                className={`${className} rounded-full border border-white/20 shadow-inner ${spinning ? "animate-spin" : ""}`}
                style={{
                    background: "conic-gradient( #f9c2c2, #f9f9c2, #c2f9c9, #c2f3f9, #c2d1f9, #f3c2f9, #f9c2c2)",
                    WebkitMaskImage: mask,
                    maskImage: mask,
                }}
                aria-hidden
            ></div>
        );
    }

    return (
        <header className="relative z-20 w-full">
            <div className="mx-auto max-w-6x1 px-4 sm:px-6">
                <div className="h-14 sm:h-16 flex items-center justify-between">
                    <div className="relative flex flex-col items-center gap-2">
                        {/* Trigger */}
                        <button
                            ref={btnRef}
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={open}
                            aria-controls="bg-dropdown"
                            onClick={() => {
                                setSpinning(true);
                                setTimeout(() => setSpinning(false),
                            500)
                                setOpen(o => !o)
                            }}
                            className="group inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 active:bg-white/20 transition px-2.5 py-1.5 ring-1 ring-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 backdrop-blur"
                        >
                            <ColorWheelIcon />
                        </button>

                        {/* Dropdown */}
                        {open && (
                            <div ref={panelRef} className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-30">
                                <div
                                    id="bg-dropdown"
                                    role="menu"
                                    aria-label="Background options"
                                    className="rounded-full bg-white/10 backdrop-blur ring-1 ring-white/20 p-1 flex flex-col items-center"
                                    style={{ width: panelW ? `${panelW}px` : undefined }}
                                >
                                    <div className="flex flex-col gap-1.5 items-center">
                                        {options.map(opt => (
                                            <button
                                                key={opt.key}
                                                role="menuitemradio"
                                                aria-checked={opt.key === value}
                                                onClick={() => { onSelect?.(opt.key); setOpen(false); requestAnimationFrame(() => btnRef.current?.focus()); }}
                                                className={`relative h-6 w-6 rounded-full overflow-hidden ring-1 ring-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${opt.key===value?"outline outline-2 outline-sky-400":"hover:ring-white/25"}`}
                                                title={opt.label}
                                            >
                                                <div className="absolute inset-0" style={{ background: opt.swatch }} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <nav className="flex items-center gap-6 text-sm text-white/90">
                        <a href="#experience" className="hover:underline underline-offset-4">experience</a>
                        <a href="#projects" className="hover:underline underline-offset-4">projects</a>
                        <a href="#contact" className="hover:underline underline-offset-4">contact</a>
                        <div className="ml-2 font-semibold tracking-wide cursor-pointer">{brand}</div>
                    </nav>
                </div>
            </div>
        </header>
    )
}