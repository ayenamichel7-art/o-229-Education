import React, { useState, useEffect } from "react";
import { Receipt, X, Clock } from "lucide-react";
import { useFinanceStore } from "../store/useFinanceStore";
import { useStudentStore } from "../store/useStudentStore";
import { apiClient } from "../api/apiClient";
import toast from "react-hot-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { recordPayment } = useFinanceStore();

  // We need to fetch students so the user can select who is paying.
  const { students, fetchStudents } = useStudentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && students.length === 0) {
      fetchStudents(""); // Fetch once
    }
  }, [isOpen, students.length, fetchStudents]);

  const [formData, setFormData] = useState({
    student_id: "",
    amount: "",
    type: "tuition",
    payment_method: "cash",
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
    if (!formData.student_id || !formData.amount) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      formData.payment_method === "mobile_money"
        ? "Initialisation du paiement mobile..."
        : "Enregistrement du paiement...",
    );

    try {
      // 1. Create the payment record
      const payment = await recordPayment({
        student_id: Number(formData.student_id),
        amount: Number(formData.amount),
        amount_paid:
          formData.payment_method === "mobile_money"
            ? 0
            : Number(formData.amount),
        type: formData.type,
        payment_method: formData.payment_method,
        status: formData.payment_method === "mobile_money" ? "pending" : "paid",
      });

      // 2. If Mobile Money, initiate the gateway
      if (formData.payment_method === "mobile_money") {
        const initRes = await apiClient.post("/payments/initiate", {
          payment_id: payment.id,
          method: "mobile_money",
        });

        toast.success("Redirection vers le portail de paiement...", {
          id: toastId,
        });

        // Redirect to the local gateway (Orange, MTN, Wave etc.)
        setTimeout(() => {
          window.location.href = initRes.data.payment_url;
        }, 1000);
      } else {
        toast.success("Paiement enregistré avec succès.", { id: toastId });
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors du traitement", {
        id: toastId,
      });
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
        zIndex: 100,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "450px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
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
          <div>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#1E293B",
                margin: 0,
              }}
            >
              Nouveau Règlement
            </h2>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#64748B",
                margin: "4px 0 0",
              }}
            >
              Enregistrez une transaction scolaire
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#F1F5F9",
              border: "none",
              cursor: "pointer",
              color: "#64748B",
              padding: "6px",
              borderRadius: "50%",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem" }}>
          <form
            id="payment-form"
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Student Dropdown */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "0.35rem",
                }}
              >
                Élève / Étudiant
              </label>
              <select
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "10px",
                  border: "1.5px solid #E2E8F0",
                  fontSize: "0.95rem",
                  background: "#F8FAFC",
                }}
              >
                <option value="" disabled>
                  Sélectionner un élève...
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} ({s.matricule})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "0.35rem",
                }}
              >
                Montant (FCFA)
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontWeight: 600,
                    color: "#94A3B8",
                  }}
                >
                  XOF
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  step="100"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: "1.5px solid #E2E8F0",
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payment specifics */}
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
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "0.35rem",
                  }}
                >
                  Type de frais
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: "1.5px solid #E2E8F0",
                    fontSize: "0.95rem",
                    background: "#F8FAFC",
                  }}
                >
                  <option value="tuition">Scolarité</option>
                  <option value="registration">Inscription</option>
                  <option value="exam">Examen</option>
                  <option value="transport">Transport</option>
                  <option value="uniform">Uniforme</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "0.35rem",
                  }}
                >
                  Méthode
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: "1.5px solid #E2E8F0",
                    fontSize: "0.95rem",
                    background: "#F8FAFC",
                  }}
                >
                  <option value="cash">Espèces</option>
                  <option value="mobile_money">Mobile Money 📱</option>
                  <option value="bank_transfer">Virement</option>
                  <option value="card">Carte</option>
                </select>
              </div>
            </div>

            {formData.payment_method === "mobile_money" && (
              <div
                style={{
                  background: "#F0F9FF",
                  border: "1px solid #BAE6FD",
                  padding: "1rem",
                  borderRadius: "12px",
                  marginTop: "0.5rem",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.8rem",
                    color: "#0369A1",
                    lineHeight: "1.4",
                  }}
                >
                  <strong>✓ Recommandation d'optimisation :</strong>
                  <br />
                  Assurez-vous que le compte possède le solde nécessaire
                  (incluant les frais d'opérateur) et que le numéro soit prêt
                  pour la validation USSD.
                </p>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      background: "#FF6600",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    ORANGE
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      background: "#FFCC00",
                      color: "black",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    MTN
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      background: "#2196F3",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    WAVE
                  </span>
                </div>
              </div>
            )}
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
              padding: "0.65rem 1.25rem",
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              background: "white",
              color: "#475569",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Fermer
          </button>
          <button
            type="submit"
            form="payment-form"
            disabled={isSubmitting}
            style={{
              padding: "0.65rem 1.5rem",
              borderRadius: "10px",
              border: "none",
              background:
                formData.payment_method === "mobile_money"
                  ? "#0369A1"
                  : "var(--gradient-primary)",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              opacity: isSubmitting ? 0.7 : 1,
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
          >
            {formData.payment_method === "mobile_money" ? (
              <Clock size={18} />
            ) : (
              <Receipt size={18} />
            )}
            {isSubmitting
              ? "Traitement..."
              : formData.payment_method === "mobile_money"
                ? "Payer par Mobile Money"
                : "Valider l'encaissement"}
          </button>
        </div>
      </div>
    </div>
  );
};
