"use client";

import { useState } from "react";

export default function HomePage() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tournament, setTournament] = useState("T20_WC");
  const [startDate, setStartDate] = useState("2026-03-01");
  const [hostCountry, setHostCountry] = useState("India");

  const handleGenerateSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/generate_schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournament, start_date: startDate, host_country: hostCountry })
      });
      const data = await response.json();
      setSchedule(data);
    } catch (err) {
      console.error(err);
      alert("Error generating schedule. Make sure backend is running!");
    }
    setLoading(false);
  };

  const countries = ["India","Pakistan","Australia","England","South Africa","New Zealand","Sri Lanka","Bangladesh","Afghanistan","Nepal","West Indies"];

  return (
    <div style={{
      padding: "2rem",
      fontFamily: "'Poppins', sans-serif",
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #0f2027, #203a43, #2c5364)",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <h1 style={{ color: "#00f2fe", fontSize: "2.5rem", marginBottom: "2rem" }}>ICC Tournament Scheduler</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginBottom: "2rem" }}>
        <select value={tournament} onChange={e => setTournament(e.target.value)} style={selectStyle}>
          <option value="T20_WC">T20 World Cup</option>
          <option value="ODI_WC">ODI World Cup</option>
          <option value="Asia_Cup">Asia Cup</option>
          <option value="Champions_Trophy">Champions Trophy</option>
        </select>

        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={selectStyle} />

        <select value={hostCountry} onChange={e => setHostCountry(e.target.value)} style={selectStyle}>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button onClick={handleGenerateSchedule} disabled={loading} style={buttonStyle}>
          {loading ? "Generating..." : "Generate Schedule"}
        </button>
      </div>

      {schedule && (
        <div style={{ width: "100%", maxWidth: "900px" }}>
          <h2 style={sectionTitle}>Groups</h2>
          <div style={groupStyle}><strong>Group A:</strong> {schedule.groups.A.join(", ")}</div>
          <div style={groupStyle}><strong>Group B:</strong> {schedule.groups.B.join(", ")}</div>

          <h2 style={sectionTitle}>Group Matches</h2>
          <div style={gridContainer}>
            {schedule.group_matches.map((m, i) => (
              <div key={i} style={matchCard}>
                <div style={matchDate}>{m.date} ({m.time})</div>
                <div style={teams}>{m.teams[0]} vs {m.teams[1]}</div>
                <div style={stadium}>{m.stadium}</div>
                <div style={groupBadge}>{m.group}</div>
              </div>
            ))}
          </div>

          <h2 style={sectionTitle}>Knockout Matches</h2>
          <div style={gridContainer}>
            {schedule.knockout_matches.map((m, i) => (
              <div key={i} style={matchCard}>
                <div style={matchDate}>{m.date} ({m.time})</div>
                <div style={teams}>{m.teams[0]} vs {m.teams[1]}</div>
                <div style={stadium}>{m.stadium}</div>
                <div style={groupBadge}>{m.group}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const selectStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "none",
  outline: "none",
  fontSize: "1rem"
};

const buttonStyle = {
  padding: "0.5rem 1.5rem",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #00f2fe, #4facfe)",
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "transform 0.2s",
};

const sectionTitle = {
  fontSize: "1.8rem",
  marginTop: "2rem",
  marginBottom: "1rem",
  color: "#00f2fe",
  textAlign: "center"
};

const groupStyle = {
  background: "rgba(255,255,255,0.1)",
  padding: "0.5rem 1rem",
  margin: "0.5rem 0",
  borderRadius: "8px",
  textAlign: "center"
};

const gridContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
  gap: "1rem"
};

const matchCard = {
  background: "linear-gradient(145deg, #1c3c60, #0f2027)",
  padding: "1rem",
  borderRadius: "15px",
  boxShadow: "0 8px 15px rgba(0,0,0,0.3)",
  textAlign: "center",
  transition: "transform 0.3s, box-shadow 0.3s",
  cursor: "pointer"
};

const matchDate = { fontWeight: "bold", marginBottom: "0.5rem", color: "#00f2fe" };
const teams = { fontSize: "1.1rem", marginBottom: "0.5rem" };
const stadium = { fontSize: "0.9rem", marginBottom: "0.5rem", fontStyle: "italic" };
const groupBadge = { display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "12px", background: "#00d4ff", color: "#000", fontWeight: "bold", fontSize: "0.8rem" };
