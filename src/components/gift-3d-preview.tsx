import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type Props = {
  coverSwatch: string;
  coverName: string;
  qrValue?: string;
};

export function Gift3DPreview({ coverSwatch, coverName, qrValue }: Props) {
  const [angle, setAngle] = useState(-20);
  return (
    <div className="w-full">
      <div
        className="relative mx-auto"
        style={{
          width: 280,
          height: 320,
          perspective: 1200,
        }}
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${angle}deg) rotateX(-15deg)`,
          }}
        >
          {/* Box body — 4 faces */}
          {[
            { tf: "translateZ(90px)" },                              // front
            { tf: "rotateY(180deg) translateZ(90px)" },              // back
            { tf: "rotateY(90deg) translateZ(90px)" },               // right
            { tf: "rotateY(-90deg) translateZ(90px)" },              // left
          ].map((f, idx) => (
            <div
              key={idx}
              className="absolute top-1/2 left-1/2 rounded-lg shadow-2xl"
              style={{
                width: 180,
                height: 180,
                marginLeft: -90,
                marginTop: -50,
                background: coverSwatch,
                transform: f.tf,
                backfaceVisibility: "hidden",
                boxShadow: "inset 0 0 40px rgba(255,255,255,0.25)",
              }}
            />
          ))}
          {/* Top */}
          <div
            className="absolute top-1/2 left-1/2 rounded-lg"
            style={{
              width: 184,
              height: 184,
              marginLeft: -92,
              marginTop: -52,
              background: coverSwatch,
              transform: "rotateX(90deg) translateZ(90px)",
              boxShadow: "inset 0 0 60px rgba(255,255,255,0.4)",
            }}
          />
          {/* Bottom */}
          <div
            className="absolute top-1/2 left-1/2 rounded-lg"
            style={{
              width: 180,
              height: 180,
              marginLeft: -90,
              marginTop: -50,
              background: "rgba(0,0,0,0.3)",
              transform: "rotateX(-90deg) translateZ(90px)",
            }}
          />

          {/* Ribbon vertical */}
          <div
            className="absolute top-1/2 left-1/2"
            style={{
              width: 30,
              height: 200,
              marginLeft: -15,
              marginTop: -60,
              background: "linear-gradient(180deg,#fff,#fce7f3)",
              transform: "translateZ(91px)",
              boxShadow: "0 0 8px rgba(0,0,0,0.1)",
            }}
          />
          {/* Ribbon horizontal */}
          <div
            className="absolute top-1/2 left-1/2"
            style={{
              width: 200,
              height: 30,
              marginLeft: -100,
              marginTop: 25,
              background: "linear-gradient(90deg,#fff,#fce7f3)",
              transform: "translateZ(91px)",
            }}
          />
          {/* Bow */}
          <div
            className="absolute top-1/2 left-1/2"
            style={{
              width: 70,
              height: 40,
              marginLeft: -35,
              marginTop: -75,
              background: "radial-gradient(circle,#fff 30%,#f9a8d4)",
              borderRadius: "50%",
              transform: "translateZ(92px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          />

          {/* QR sticker */}
          {qrValue && (
            <div
              className="absolute top-1/2 left-1/2 bg-white p-1.5 rounded-md shadow-lg"
              style={{
                width: 64,
                height: 64,
                marginLeft: 5,
                marginTop: 5,
                transform: "translateZ(92px) rotate(-6deg)",
              }}
            >
              <QRCodeSVG value={qrValue} size={52} fgColor="#831843" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={() => setAngle((a) => a - 30)}
          className="px-3 py-1.5 rounded-full bg-[var(--pink-100)] text-[var(--pink-700)] text-xs"
        >
          ← Rotate
        </button>
        <span className="text-xs text-muted-foreground">{coverName}</span>
        <button
          onClick={() => setAngle((a) => a + 30)}
          className="px-3 py-1.5 rounded-full bg-[var(--pink-100)] text-[var(--pink-700)] text-xs"
        >
          Rotate →
        </button>
      </div>
    </div>
  );
}