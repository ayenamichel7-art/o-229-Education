import React, { useState, useEffect } from "react";
import {
  UserCheck,
  UserX,
  Clock,
  Shield,
  Search,
  Calendar as CalendarIcon,
  Filter,
  Eye,
  Activity,
} from "lucide-react";
import { apiClient } from "../api/apiClient";
import toast from "react-hot-toast";

interface StaffPresence {
  user_id: number;
  name: string;
  role: string;
  status: "present" | "absent" | "late" | "half-day";
  check_in: string | null;
  check_out: string | null;
  remarks: string;
}

export const StaffMonitoring: React.FC = () => {
  const [staff, setStaff] = useState<StaffPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStaffAttendance();
  }, [date]);

  const fetchStaffAttendance = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/staff-attendance?date=${date}`);
      setStaff(res.data.data);
    } catch (err) {
      toast.error("Erreur lors de la récupération des données de surveillance");
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = {
    total: staff.length,
    present: staff.filter((s) => s.status === "present").length,
    absent: staff.filter((s) => s.status === "absent").length,
    late: staff.filter((s) => s.status === "late").length,
  };

  return (
    <div className="animate-fade-in">
      <header
        style={{
          marginBottom: "2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2rem",
              color: "var(--surface-900)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <Shield size={32} color="var(--primary)" />
            Surveillance du Personnel
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Contrôle de présence et ponctualité des professeurs et
            administratifs
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ position: "relative" }}>
            <CalendarIcon
              size={18}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </div>
      </header>

      {/* Real-time Dashboard Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: "1.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-10px",
              top: "-10px",
              opacity: 0.1,
            }}
          >
            <Activity size={80} />
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Total Personnel
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginTop: "0.5rem",
            }}
          >
            {stats.total}
          </div>
        </div>
        <div
          className="glass-card"
          style={{ padding: "1.5rem", borderLeft: "4px solid #10B981" }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            En Poste
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#10B981",
              marginTop: "0.5rem",
            }}
          >
            {stats.present}
          </div>
        </div>
        <div
          className="glass-card"
          style={{ padding: "1.5rem", borderLeft: "4px solid #F59E0B" }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Retards
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#F59E0B",
              marginTop: "0.5rem",
            }}
          >
            {stats.late}
          </div>
        </div>
        <div
          className="glass-card"
          style={{ padding: "1.5rem", borderLeft: "4px solid #EF4444" }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Absents
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#EF4444",
              marginTop: "0.5rem",
            }}
          >
            {stats.absent}
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              className="input"
              placeholder="Rechercher un professeur ou un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", paddingLeft: "2.5rem" }}
            />
          </div>
          <button
            className="btn btn-secondary"
            style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <Filter size={18} /> Filtrer par rôle
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                textAlign: "left",
                borderBottom: "2px solid var(--surface-100)",
              }}
            >
              <th
                style={{
                  padding: "1rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Personnel
              </th>
              <th
                style={{
                  padding: "1rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Rôle
              </th>
              <th
                style={{
                  padding: "1rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Arrivée
              </th>
              <th
                style={{
                  padding: "1rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Départ
              </th>
              <th
                style={{
                  padding: "1rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Statut
              </th>
              <th
                style={{
                  padding: "1rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: "3rem", textAlign: "center" }}
                >
                  Analyse des présences en cours...
                </td>
              </tr>
            ) : (
              filteredStaff.map((person) => (
                <tr
                  key={person.user_id}
                  style={{ borderBottom: "1px solid var(--surface-50)" }}
                >
                  <td style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "var(--surface-100)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          color: "var(--primary)",
                        }}
                      >
                        {person.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{person.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        background: "var(--surface-100)",
                        color: "var(--text-muted)",
                        textTransform: "capitalize",
                      }}
                    >
                      {person.role}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", fontFamily: "monospace" }}>
                    {person.check_in ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          color: "#10B981",
                        }}
                      >
                        <Clock size={14} /> {person.check_in}
                      </span>
                    ) : (
                      "--:--"
                    )}
                  </td>
                  <td style={{ padding: "1rem", fontFamily: "monospace" }}>
                    {person.check_out ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        <Clock size={14} /> {person.check_out}
                      </span>
                    ) : (
                      "--:--"
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {person.status === "present" ? (
                        <UserCheck size={16} color="#10B981" />
                      ) : (
                        <UserX size={16} color="#EF4444" />
                      )}
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color:
                            person.status === "present"
                              ? "#10B981"
                              : person.status === "absent"
                                ? "#EF4444"
                                : "#F59E0B",
                        }}
                      >
                        {person.status === "present"
                          ? "En Poste"
                          : person.status === "absent"
                            ? "Absent"
                            : "En Retard"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "0.4rem", borderRadius: "6px" }}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
