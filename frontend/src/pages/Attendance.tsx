import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Save,
  Users,
  Calendar as CalendarIcon,
  Bell,
} from "lucide-react";
import { apiClient } from "../api/apiClient";
import toast from "react-hot-toast";

interface StudentAttendance {
  student_id: number;
  name: string;
  status: "present" | "absent" | "late" | "excused";
  remarks: string;
}

export const AttendancePage: React.FC = () => {
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAttendance();
    }
  }, [selectedClass, date]);

  const fetchClasses = async () => {
    try {
      // Mock or fetch classes
      setClasses([
        { id: 1, name: "6ème A" },
        { id: 2, name: "5ème B" },
      ]);
      setSelectedClass("1");
    } catch (err) {
      toast.error("Erreur chargement classes");
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        `/attendance?class_id=${selectedClass}&date=${date}`,
      );
      setStudents(res.data.data);
    } catch (err) {
      toast.error("Erreur chargement liste");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (
    id: number,
    status: "present" | "absent" | "late" | "excused",
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === id ? { ...s, status } : s)),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Enregistrement et envoi des alertes...");
    try {
      await apiClient.post("/attendance", {
        class_id: selectedClass,
        date: date,
        attendance: students,
      });
      toast.success("Pointage terminé ! Les parents ont été notifiés.", {
        id: toastId,
      });
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const stats = {
    present: students.filter((s) => s.status === "present").length,
    absent: students.filter((s) => s.status === "absent").length,
    late: students.filter((s) => s.status === "late").length,
  };

  return (
    <div className="animate-fade-in">
      <header
        style={{
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", color: "var(--surface-900)" }}>
            Pointage de Présence
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Signalez les absences en temps réel aux parents
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
          <select
            className="input"
            style={{ minWidth: "150px" }}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Stats Cards */}
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
          style={{ padding: "1.25rem", borderLeft: "4px solid #10B981" }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Présents
          </div>
          <div
            style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#065F46" }}
          >
            {stats.present}
          </div>
        </div>
        <div
          className="glass-card"
          style={{ padding: "1.25rem", borderLeft: "4px solid #EF4444" }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Absents
          </div>
          <div
            style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#991B1B" }}
          >
            {stats.absent}
          </div>
        </div>
        <div
          className="glass-card"
          style={{ padding: "1.25rem", borderLeft: "4px solid #F59E0B" }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Retards
          </div>
          <div
            style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#92400E" }}
          >
            {stats.late}
          </div>
        </div>
        <div
          className="glass-card"
          style={{
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--primary)",
            color: "white",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Bell size={20} style={{ margin: "0 auto 0.25rem" }} />
            <div style={{ fontSize: "0.7rem" }}>Alertes Parents Actives</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface-50)", textAlign: "left" }}>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--surface-200)",
                }}
              >
                Élève
              </th>
              <th
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--surface-200)",
                  textAlign: "center",
                }}
              >
                Statut de Présence
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={2}
                  style={{ textAlign: "center", padding: "3rem" }}
                >
                  Chargement de la classe...
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student.student_id}
                  style={{ borderBottom: "1px solid var(--surface-100)" }}
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
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "var(--surface-100)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Users size={16} color="var(--text-muted)" />
                      </div>
                      <span style={{ fontWeight: 500 }}>{student.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() =>
                          toggleStatus(student.student_id, "present")
                        }
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "8px",
                          border: "1px solid #10B981",
                          background:
                            student.status === "present"
                              ? "#10B981"
                              : "transparent",
                          color:
                            student.status === "present" ? "white" : "#10B981",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        <CheckCircle size={14} /> Présent
                      </button>
                      <button
                        onClick={() =>
                          toggleStatus(student.student_id, "absent")
                        }
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "8px",
                          border: "1px solid #EF4444",
                          background:
                            student.status === "absent"
                              ? "#EF4444"
                              : "transparent",
                          color:
                            student.status === "absent" ? "white" : "#EF4444",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        <XCircle size={14} /> Absent
                      </button>
                      <button
                        onClick={() => toggleStatus(student.student_id, "late")}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "8px",
                          border: "1px solid #F59E0B",
                          background:
                            student.status === "late"
                              ? "#F59E0B"
                              : "transparent",
                          color:
                            student.status === "late" ? "white" : "#F59E0B",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        <Clock size={14} /> Retard
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div
          style={{
            padding: "1.5rem",
            background: "var(--surface-50)",
            borderTop: "1px solid var(--surface-200)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            ⚠️ Cliquer sur "Enregistrer" déclenchera l'envoi immédiat du rapport
            aux parents.
          </p>
          <button
            onClick={handleSave}
            disabled={isSaving || students.length === 0}
            className="btn btn-primary"
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              padding: "0.75rem 2rem",
            }}
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Enregistrer le Pointage
          </button>
        </div>
      </div>
    </div>
  );
};

// Help TS find Loader2 which is likely available globally or via imports in other components
const Loader2 = ({ size, className }: { size: number; className: string }) => (
  <Clock size={size} className={className} />
);
