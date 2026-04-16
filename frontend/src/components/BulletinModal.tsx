import React, { useState } from "react";
import { X, Download, FileText, Calendar } from "lucide-react";
import { apiClient } from "../api/apiClient";
import toast from "react-hot-toast";

interface BulletinModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
}

export const BulletinModal: React.FC<BulletinModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
}) => {
  const [term, setTerm] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    const toastId = toast.loading(
      `Génération du bulletin pour ${studentName}...`,
    );
    try {
      const response = await apiClient.get(
        `/students/${studentId}/report-card?term=${term}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Bulletin_${studentName.replace(" ", "_")}_T${term}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Bulletin téléchargé avec succès !", { id: toastId });
      onClose();
    } catch (err: any) {
      toast.error(
        "Erreur lors de la génération du bulletin. Vérifiez que les notes sont saisies.",
        { id: toastId },
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1.5rem",
      }}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "white",
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.5rem",
            background: "var(--gradient-primary)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <FileText size={24} />
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
              Extraction de Bulletin
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "50%",
              color: "white",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "2rem" }}>
          <p
            style={{
              margin: "0 0 1.5rem",
              fontSize: "0.9rem",
              color: "#64748B",
              textAlign: "center",
            }}
          >
            Sélectionnez la période pour le bulletin de <br />
            <b style={{ color: "#1E293B" }}>{studentName}</b>
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <label
              style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}
            >
              Période Scolaire
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.5rem",
              }}
            >
              {[1, 2, 3].map((t) => (
                <button
                  key={t}
                  onClick={() => setTerm(t)}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border:
                      term === t
                        ? "2px solid var(--color-primary)"
                        : "1px solid #E2E8F0",
                    background: term === t ? "rgba(59,130,246,0.05)" : "white",
                    color: term === t ? "var(--color-primary)" : "#64748B",
                    fontWeight: term === t ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Tri {t}
                </button>
              ))}
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                background: "#F8FAFC",
                padding: "1rem",
                borderRadius: "12px",
                border: "1px dashed #CBD5E1",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "0.85rem",
                  color: "#64748B",
                }}
              >
                <Calendar size={16} />
                <span>Année Scolaire 2025-2026</span>
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn btn-primary"
              style={{
                marginTop: "1rem",
                padding: "1rem",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                fontSize: "1rem",
              }}
            >
              <Download size={20} />
              {isDownloading ? "Génération..." : "Télécharger le PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
