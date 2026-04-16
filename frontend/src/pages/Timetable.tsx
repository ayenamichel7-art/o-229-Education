import React, { useState, useEffect } from "react";
import { Calendar, User, MapPin, Plus, Trash2, Filter } from "lucide-react";
import { apiClient } from "../api/apiClient";

import toast from "react-hot-toast";

interface TimetableEntry {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
  subject: { name: string; code: string };
  teacher: { user: { first_name: string; last_name: string } };
  class_id: number;
}

import { TimetableModal } from "../components/TimetableModal";

export const Timetable: React.FC = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable();
    } else {
      setEntries([]); // Clear entries if no class is selected
      setLoading(false);
    }
  }, [selectedClass]);

  const fetchInitialData = async () => {
    try {
      const res = await apiClient.get("/classes");
      setClasses(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedClass(res.data.data[0].id.toString());
      }
    } catch (err) {
      toast.error("Erreur lors du chargement des classes");
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/timetable?class_id=${selectedClass}`);
      setEntries(res.data.data);
    } catch (err) {
      toast.error("Erreur lors du chargement de l'emploi du temps");
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: number) => {
    if (!window.confirm("Supprimer cette plage horaire ?")) return;
    try {
      await apiClient.delete(`/timetable/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Plage horaire supprimée");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
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
            Emploi du Temps
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Gérez le planning hebdomadaire des classes
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Filter
              size={18}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <select
              className="input"
              style={{ paddingLeft: "2.5rem", minWidth: "200px" }}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Sélectionner une classe</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedClass}
            className="btn btn-primary"
            style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <Plus size={18} />
            Ajouter un cours
          </button>
        </div>
      </header>

      {loading && selectedClass ? (
        <div style={{ textAlign: "center", padding: "5rem" }}>
          Chargement du planning...
        </div>
      ) : !selectedClass ? (
        <div
          className="glass-card"
          style={{
            padding: "4rem",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <Calendar size={48} style={{ margin: "0 auto 1rem", opacity: 0.2 }} />
          <p>
            Veuillez sélectionner une classe pour afficher son emploi du temps
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: "0", overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              minWidth: "800px",
            }}
          >
            <thead>
              <tr style={{ background: "var(--surface-50)" }}>
                <th
                  style={{
                    width: "100px",
                    padding: "1rem",
                    borderBottom: "1px solid var(--surface-200)",
                  }}
                >
                  HEURE
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid var(--surface-200)",
                      textTransform: "uppercase",
                      fontSize: "0.85rem",
                    }}
                  >
                    {day === "monday"
                      ? "Lundi"
                      : day === "tuesday"
                        ? "Mardi"
                        : day === "wednesday"
                          ? "Mercredi"
                          : day === "thursday"
                            ? "Jeudi"
                            : day === "friday"
                              ? "Vendredi"
                              : "Samedi"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td
                    style={{
                      padding: "1.5rem 1rem",
                      borderBottom: "1px solid var(--surface-100)",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                      textAlign: "center",
                      background: "var(--surface-50)",
                    }}
                  >
                    {time}
                  </td>
                  {days.map((day) => {
                    const entry = entries.find(
                      (e) =>
                        e.day_of_week === day && e.start_time.startsWith(time),
                    );
                    return (
                      <td
                        key={`${day}-${time}`}
                        style={{
                          padding: "0.5rem",
                          borderBottom: "1px solid var(--surface-100)",
                          borderRight: "1px solid var(--surface-100)",
                        }}
                      >
                        {entry ? (
                          <div
                            style={{
                              background: "var(--primary-light)",
                              borderLeft: "4px solid var(--primary)",
                              padding: "0.75rem",
                              borderRadius: "4px",
                              position: "relative",
                              transition: "transform 0.2s",
                            }}
                            className="hover:scale-105"
                          >
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              style={{
                                position: "absolute",
                                top: "0.25rem",
                                right: "0.25rem",
                                padding: "0.25rem",
                                color: "#EF4444",
                                opacity: 0.5,
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                              }}
                              className="hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                            <div
                              style={{
                                fontWeight: "bold",
                                fontSize: "0.85rem",
                                marginBottom: "0.25rem",
                                color: "var(--primary)",
                              }}
                            >
                              {entry.subject.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--surface-600)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <User size={12} />{" "}
                              {entry.teacher?.user?.first_name[0]}.{" "}
                              {entry.teacher?.user?.last_name}
                            </div>
                            {entry.room && (
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  marginTop: "0.25rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  color: "var(--text-muted)",
                                }}
                              >
                                <MapPin size={10} /> {entry.room}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TimetableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTimetable}
        classId={selectedClass}
      />
    </div>
  );
};
