import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStudentStore, Student } from "../store/useStudentStore";
import toast from "react-hot-toast";

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If student is provided, we are editing. Otherwise, creating.
  student?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { t } = useTranslation();
  const { addStudent, updateStudent } = useStudentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    first_name: student?.first_name || "",
    last_name: student?.last_name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    gender: student?.gender || "male",
    // Minimal mock definition for grade to let it pass
    grade_id: student?.grade?.id || 1,
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const toastId = toast.loading(
      student ? t("common.updating") : "Création en cours...",
    );

    try {
      if (student) {
        await updateStudent(student.id, formData);
        toast.success("Étudiant mis à jour avec succès", { id: toastId });
      } else {
        await addStudent(formData);
        toast.success("Étudiant ajouté avec succès", { id: toastId });
      }
      onClose();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Une erreur est survenue lors de la sauvegarde.",
        { id: toastId },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "500px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#1E293B",
              margin: 0,
            }}
          >
            {student ? "Éditer l'élève" : "Nouvel élève"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748B",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem", overflowY: "auto" }}>
          <form
            id="student-form"
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#475569",
                    marginBottom: "0.25rem",
                  }}
                >
                  Prénom *
                </label>
                <input
                  required
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.95rem",
                  }}
                  placeholder="Ex: Amara"
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#475569",
                    marginBottom: "0.25rem",
                  }}
                >
                  Nom *
                </label>
                <input
                  required
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.95rem",
                  }}
                  placeholder="Ex: Diallo"
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#475569",
                  marginBottom: "0.25rem",
                }}
              >
                Email *
              </label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.95rem",
                }}
                placeholder="Ex: eleve@ecole.com"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#475569",
                    marginBottom: "0.25rem",
                  }}
                >
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.95rem",
                  }}
                  placeholder="+225 00 00 00 00"
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#475569",
                    marginBottom: "0.25rem",
                  }}
                >
                  Sexe *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.95rem",
                    background: "white",
                  }}
                >
                  <option value="male">Masculin</option>
                  <option value="female">Féminin</option>
                </select>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#475569",
                  marginBottom: "0.25rem",
                }}
              >
                Classe (Scolarité)
              </label>
              <select
                name="grade_id"
                value={formData.grade_id}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.95rem",
                  background: "white",
                }}
              >
                {/* Fake classes for presentation UI. Usually fetched from API. */}
                <option value="1">6ème</option>
                <option value="2">5ème</option>
                <option value="3">4ème</option>
                <option value="4">3ème</option>
                <option value="5">Seconde</option>
                <option value="6">Première</option>
                <option value="7">Terminale</option>
              </select>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            backgroundColor: "#F8FAFC",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              background: "white",
              color: "#475569",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            form="student-form"
            disabled={isSubmitting}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              border: "none",
              background: "var(--gradient-primary)",
              color: "white",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <Save size={18} />
            {isSubmitting ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};
