"use client";

import { useState, useRef } from "react";

type VoiceOption = {
  id: string;
  label: string;
  voice: string;
  img: string;
};

export default function TTSPage() {
  const [text, setText] = useState(
    "A small fire broke out today.\nNo one was hurt.\nFirefighters stopped it quickly."
  );
  const [voice, setVoice] = useState("en-US-JennyNeural");
  // UI speed (0.3, 0.5, 0.8, 1.0) – only used on the browser side
  const [speed, setSpeed] = useState(0.5);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voices: VoiceOption[] = [
    {
      id: "us-female",
      label: "American Female",
      voice: "en-US-JennyNeural",
      img: "/voices/american-female.png",
    },
    {
      id: "us-male",
      label: "American Male",
      voice: "en-US-GuyNeural",
      img: "/voices/american-male.png",
    },
    {
      id: "uk-female",
      label: "British Female",
      voice: "en-GB-LibbyNeural",
      img: "/voices/british-female.png",
    },
    {
      id: "uk-male",
      label: "British Male",
      voice: "en-GB-RyanNeural",
      img: "/voices/british-male.png",
    },
  ];

  const generateAudio = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Backend only needs text + voice; speed is handled in the browser
        body: JSON.stringify({ text, voice }),
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error("TTS error:", msg);
        alert(msg || "TTS error from server.");
        return;
      }

      const buffer = await res.arrayBuffer();
      const blob = new Blob([buffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
    } catch (err) {
      console.error("TTS request failed:", err);
      alert("TTS request failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;
    const audio = audioRef.current;
    if (!audio) return;

    // Restart and play at the selected speed
    audio.pause();
    audio.currentTime = 0;
    audio.playbackRate = speed;
    audio.play();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 40,
      }}
    >
      {/* Centered card container */}
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          background: "#020617",
          borderRadius: 16,
          border: "1px solid #1f2937",
          padding: 24,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
          Simple News TTS Practice
        </h1>

        <div
          style={{
            display: "flex",
            gap: 24,
          }}
        >
          {/* LEFT SIDE: Text area */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>News Script</h2>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: "100%",
                height: "260px",
                padding: 16,
                borderRadius: 12,
                background: "#1e293b",
                color: "white",
                fontSize: "18px",
                lineHeight: "1.6",
                border: "1px solid #334155",
                resize: "vertical",
              }}
            />

            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 10,
              }}
            >
              <button
                onClick={() => setText("")}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#475569",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(text)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#38bdf8",
                  color: "black",
                  cursor: "pointer",
                }}
              >
                Copy
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Voices + Speed + Player */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Select Voice</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {voices.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setVoice(v.voice)}
                  style={{
                    border:
                      voice === v.voice
                        ? "3px solid #38bdf8"
                        : "2px solid #475569",
                    borderRadius: 12,
                    padding: "12px 8px",
                    cursor: "pointer",
                    textAlign: "center",
                    background: "#1e293b",
                    transition: "0.15s",
                  }}
                >
                  <img
                    src={v.img}
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      margin: "0 auto 6px auto",
                      display: "block",
                    }}
                  />
                  <div style={{ fontSize: 14 }}>{v.label}</div>
                </div>
              ))}
            </div>

            <h2 style={{ marginTop: 20, fontSize: 18 }}>Speed</h2>

            <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
              {[0.3, 0.5, 0.8, 1.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={{
                    padding: "8px 16px",
                    background: speed === s ? "#38bdf8" : "#475569",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>

            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              0.3x = very slow, 0.5x = slow, 0.8x = near natural, 1.0x = normal
            </div>

            <h2 style={{ marginTop: 20, fontSize: 18 }}>Player</h2>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={generateAudio}
                disabled={loading}
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  background: loading ? "#64748b" : "#38bdf8",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                {loading ? "Generating..." : "Generate Audio"}
              </button>

              <button
                onClick={playAudio}
                disabled={!audioUrl}
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  background: audioUrl ? "#22c55e" : "#64748b",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Play
              </button>
            </div>

            <audio ref={audioRef} src={audioUrl || undefined} />
          </div>
        </div>
      </div>
    </main>
  );
}