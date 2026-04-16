import React, { useState, useEffect } from "react";
import {
  Trophy,
  Plus,
  FileCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { apiClient } from "../api/apiClient";
import toast from "react-hot-toast";

interface Exam {
  id: number;
  name: string;
  type: string;
  date: string;
  status: string;
  max_score: number;
  term: number;
  subject: { name: string };
  school_class: { name: string };
}

import { ExamModal } from "../components/ExamModal";
import { GradeEntry } from "../components/GradeEntry";

export const Exams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradingExamId, setGradingExamId] = useState<number | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!gradingExamId) fetchExams();
  }, [selectedClass, gradingExamId]);

  const fetchInitialData = async () => {
    try {
      const res = await apiClient.get("/classes");
      setClasses(res.data.data);
    } catch (err) {
      toast.error("Erreur de chargement");
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      const url = selectedClass ? `/exams?class_id=${selectedClass}` : "/exams";
      const res = await apiClient.get(url);
      setExams(res.data.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des évaluations");
    } finally {
      setLoading(false);
    }
  };

  const publishResults = async (id: number) => {
    try {
      await apiClient.post(`/exams/${id}/publish`);
      toast.success("Résultats publiés !");
      fetchExams();
    } catch (err) {
      toast.error("Erreur de publication");
    }
  };

  const deleteExam = async (id: number) => {
    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer cette évaluation et TOUTES les notes associées ?",
      )
    )
      return;
    try {
      await apiClient.delete(`/exams/${id}`);
      toast.success("Évaluation supprimée");
      fetchExams();
    } catch (err) {
      toast.error("Erreur de suppression");
    }
  };

  if (gradingExamId) {
    return (
      <GradeEntry
        examId={gradingExamId}
        onClose={() => setGradingExamId(null)}
        onSuccess={fetchExams}
      />
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span
            style={{
              background: "#D1FAE5",
              color: "#065F46",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              width: "fit-content",
            }}
          >
            <CheckCircle size={12} /> Publié
          </span>
        );
      case "results_entered":
        return (
          <span
            style={{
              background: "#DBEAFE",
              color: "#1E40AF",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              width: "fit-content",
            }}
          >
            <FileCheck size={12} /> Terminé
          </span>
        );
      default:
        return (
          <span
            style={{
              background: "#FEF3C7",
              color: "#92400E",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              width: "fit-content",
            }}
          >
            <Clock size={12} /> Planifié
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in">
      <header
        style={{
          marginBottom: "2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: 700,
              color: "#1E293B",
              marginBottom: "0.5rem",
            }}
          >
            Évaluations & Notes
          </h1>
          <p style={{ color: "#64748B", fontSize: "1.1rem" }}>
            Gérez les contrôles, compositions et le suivi des performances
            scolaires.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "12px",
          }}
        >
          <Plus size={20} />
          Organiser une évaluation
        </button>
      </header>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <div
          className="glass-card"
          style={{ padding: "1.5rem", borderLeft: "4px solid #3B82F6" }}
        >
          <div
            style={{
              color: "#64748B",
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
            }}
          >
            Moyenne Générale
          </div>
          <div
            style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1E293B" }}
          >
            14.25{" "}
            <span style={{ fontSize: "1rem", color: "#94A3B8" }}>/ 20</span>
          </div>
        </div>
        <div
          className="glass-card"
          style={{ padding: "1.5rem", borderLeft: "4px solid #F59E0B" }}
        >
          <div
            style={{
              color: "#64748B",
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
            }}
          >
            Évaluations à corriger
          </div>
          <div
            style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1E293B" }}
          >
            08
          </div>
        </div>
        <div
          className="glass-card"
          style={{ padding: "1.5rem", borderLeft: "4px solid #10B981" }}
        >
          <div
            style={{
              color: "#64748B",
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
            }}
          >
            Taux de réussite
          </div>
          <div
            style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1E293B" }}
          >
            82%
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#F8FAFC",
          }}
        >
          <div style={{ display: "flex", gap: "1rem" }}>
            <select
              className="input"
              style={{ minWidth: "220px", borderRadius: "10px" }}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Toutes les classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div
            style={{ padding: "4rem", textAlign: "center", color: "#64748B" }}
          >
            <Clock className="animate-spin" style={{ margin: "0 auto 1rem" }} />
            Chargement des évaluations...
          </div>
        ) : exams.length === 0 ? (
          <div
            style={{ padding: "5rem", textAlign: "center", color: "#94A3B8" }}
          >
            <Trophy
              size={64}
              style={{ margin: "0 auto 1.5rem", opacity: 0.1 }}
            />
            <p style={{ fontSize: "1.1rem" }}>
              Aucune évaluation trouvée pour cette sélection.
            </p>
            <p style={{ fontSize: "0.9rem" }}>
              Commencez par planifier un contrôle ou un examen.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F1F5F9", textAlign: "left" }}>
                <th
                  style={{
                    padding: "1rem 1.5rem",
                    color: "#475569",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  ÉVALUATION
                </th>
                <th
                  style={{
                    padding: "1rem 1.5rem",
                    color: "#475569",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  CLASSE & MATIÈRE
                </th>
                <th
                  style={{
                    padding: "1rem 1.5rem",
                    color: "#475569",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  DATE & TRIMESTRE
                </th>
                <th
                  style={{
                    padding: "1rem 1.5rem",
                    color: "#475569",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  STATUT
                </th>
                <th
                  style={{
                    padding: "1rem 1.5rem",
                    color: "#475569",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textAlign: "right",
                  }}
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr
                  key={exam.id}
                  style={{
                    borderBottom: "1px solid #F1F5F9",
                    transition: "background 0.2s",
                  }}
                  className="hover:bg-slate-50"
                >
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <div style={{ fontWeight: 600, color: "#1E293B" }}>
                      {exam.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748B",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "4px",
                      }}
                    >
                      <AlertCircle size={10} /> Type: {exam.type.toUpperCase()}{" "}
                      | Max: {exam.max_score}
                    </div>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 8px",
                          background: "#E2E8F0",
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                        }}
                      >
                        {exam.school_class.name}
                      </span>
                      <span style={{ color: "#475569", fontSize: "0.9rem" }}>
                        {exam.subject.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <div style={{ fontSize: "0.9rem", color: "#1E293B" }}>
                      {new Date(exam.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                      Trimestre {exam.term}
                    </div>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    {getStatusBadge(exam.status)}
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "0.5rem",
                      }}
                    >
                      {exam.status === "results_entered" && (
                        <button
                          onClick={() => publishResults(exam.id)}
                          className="btn"
                          style={{
                            background: "#10B981",
                            color: "white",
                            border: "none",
                          }}
                        >
                          Publier
                        </button>
                      )}
                      <button
                        onClick={() => setGradingExamId(exam.id)}
                        className="btn"
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.8rem",
                          background:
                            exam.status === "planned"
                              ? "var(--gradient-primary)"
                              : "#F1F5F9",
                          color:
                            exam.status === "planned" ? "white" : "#475569",
                        }}
                      >
                        {exam.status === "planned"
                          ? "Saisir les notes"
                          : "Modifier"}
                      </button>
                      <button
                        onClick={() => deleteExam(exam.id)}
                        style={{
                          padding: "4px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#F87171",
                        }}
                        className="hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ExamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchExams}
      />
    </div>
  );
};
