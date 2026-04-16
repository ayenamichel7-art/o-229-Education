import React, { useState, useEffect } from "react";
import {
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  ExternalLink,
  Linkedin,
  Plus,
  Building2,
  Calendar,
} from "lucide-react";
import { apiClient } from "../api/apiClient";
import toast from "react-hot-toast";

export const Alumni: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"directory" | "jobs">("directory");

  const [alumnis, setAlumnis] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Job Offer
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    type: "cdi",
    contact_email: "",
    application_url: "",
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "directory") {
        const res = await apiClient.get("/alumni");
        setAlumnis(res.data.data);
      } else {
        const res = await apiClient.get("/job-offers");
        setJobs(res.data.data);
      }
    } catch (err) {
      toast.error("Erreur lors de la récupération des données");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/job-offers", jobFormData);
      toast.success("Offre d'emploi publiée avec succès");
      setIsJobModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la publication",
      );
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              color: "var(--surface-900)",
              fontSize: "2rem",
              marginBottom: "0.25rem",
            }}
          >
            Alumni & Insertion Professionnelle
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Réseau des anciens élèves et opportunités de carrière
          </p>
        </div>

        {activeTab === "jobs" && (
          <button
            onClick={() => setIsJobModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={18} style={{ marginRight: "0.5rem" }} /> Publier une
            offre
          </button>
        )}
      </header>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          borderBottom: "1px solid var(--surface-200)",
          paddingBottom: "0.5rem",
        }}
      >
        <button
          onClick={() => setActiveTab("directory")}
          style={{
            background: "none",
            border: "none",
            padding: "0.5rem 1rem",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
            color:
              activeTab === "directory"
                ? "var(--primary)"
                : "var(--text-muted)",
            borderBottom:
              activeTab === "directory" ? "2px solid var(--primary)" : "none",
          }}
        >
          <GraduationCap
            size={18}
            style={{ display: "inline", marginRight: "0.5rem" }}
          />
          Annuaire des Anciens
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          style={{
            background: "none",
            border: "none",
            padding: "0.5rem 1rem",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
            color:
              activeTab === "jobs" ? "var(--primary)" : "var(--text-muted)",
            borderBottom:
              activeTab === "jobs" ? "2px solid var(--primary)" : "none",
          }}
        >
          <Briefcase
            size={18}
            style={{ display: "inline", marginRight: "0.5rem" }}
          />
          Job Board (Offres & Stages)
        </button>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--text-muted)",
          }}
        >
          Chargement en cours...
        </div>
      ) : activeTab === "directory" ? (
        // ALUMNI DIRECTORY
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {alumnis.length === 0 && (
            <p style={{ color: "var(--text-muted)" }}>
              Aucun profil public pour le moment.
            </p>
          )}
          {alumnis.map((alumni) => (
            <div
              key={alumni.id}
              className="glass-card"
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                background: "white",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}
                >
                  {alumni.user?.first_name[0]}
                  {alumni.user?.last_name[0]}
                </div>
                <div>
                  <h3
                    style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}
                  >
                    {alumni.user?.first_name} {alumni.user?.last_name}
                  </h3>
                  <div
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    <GraduationCap size={14} /> Promotion{" "}
                    {alumni.graduation_year}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "var(--surface-50)",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                    fontWeight: 500,
                  }}
                >
                  <Briefcase size={16} color="var(--primary)" />{" "}
                  {alumni.position || "En recherche d'opportunités"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                  }}
                >
                  <Building2 size={16} /> @{" "}
                  {alumni.current_company || "Indépendant"}
                </div>
              </div>

              {alumni.testimonial && (
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontStyle: "italic",
                    color: "var(--text-muted)",
                    borderLeft: "3px solid var(--primary)",
                    paddingLeft: "0.75rem",
                  }}
                >
                  "{alumni.testimonial}"
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginTop: "auto",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--surface-100)",
                }}
              >
                <a
                  href={`mailto:${alumni.user?.email}`}
                  className="btn"
                  style={{
                    flex: 1,
                    background: "var(--surface-100)",
                    color: "var(--surface-800)",
                    border: "none",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Mail size={16} style={{ marginRight: "0.5rem" }} /> Contact
                </a>
                {alumni.linkedin_url && (
                  <a
                    href={alumni.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      background: "#0A66C2",
                      color: "white",
                      border: "none",
                      padding: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Linkedin size={18} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // JOB BOARD
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {jobs.length === 0 && (
            <p style={{ color: "var(--text-muted)" }}>
              Aucune offre d'emploi ou de stage disponible.
            </p>
          )}
          {jobs.map((job) => (
            <div
              key={job.id}
              className="glass-card"
              style={{
                padding: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                background: "white",
                transition: "transform 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "var(--surface-900)",
                      margin: 0,
                    }}
                  >
                    {job.title}
                  </h3>
                  <span
                    style={{
                      background:
                        job.type === "internship" ? "#FEF3C7" : "#E0E7FF",
                      color: job.type === "internship" ? "#D97706" : "#4338CA",
                      padding: "0.2rem 0.75rem",
                      borderRadius: "1rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {job.type}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      alignItems: "center",
                    }}
                  >
                    <Building2 size={16} /> {job.company}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      alignItems: "center",
                    }}
                  >
                    <MapPin size={16} /> {job.location || "Remote"}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      alignItems: "center",
                    }}
                  >
                    <Calendar size={16} /> Publié le{" "}
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p
                  style={{
                    color: "var(--surface-700)",
                    fontSize: "0.95rem",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {job.description}
                </p>

                <div
                  style={{
                    marginTop: "1rem",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                  }}
                >
                  Soumis par : {job.creator?.first_name}{" "}
                  {job.creator?.last_name}
                </div>
              </div>

              <div
                style={{
                  marginLeft: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {job.application_url ? (
                  <a
                    href={job.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Postuler <ExternalLink size={16} />
                  </a>
                ) : (
                  <a
                    href={`mailto:${job.contact_email}`}
                    className="btn btn-primary"
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Envoyer CV <Mail size={16} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* modal create job */}
      {isJobModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="glass-card"
            style={{
              background: "white",
              padding: "2rem",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>Nouvelle Offre / Stage</h2>
            <form
              onSubmit={handleCreateJob}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label className="form-label">Titre du poste*</label>
                <input
                  required
                  type="text"
                  className="form-input"
                  value={jobFormData.title}
                  onChange={(e) =>
                    setJobFormData({ ...jobFormData, title: e.target.value })
                  }
                  placeholder="ex: Développeur React Junior"
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
                  <label className="form-label">Entreprise*</label>
                  <input
                    required
                    type="text"
                    className="form-input"
                    value={jobFormData.company}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        company: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Localisation</label>
                  <input
                    type="text"
                    className="form-input"
                    value={jobFormData.location}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        location: e.target.value,
                      })
                    }
                    placeholder="Ville ou Remote"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Type de contrat*</label>
                <select
                  className="form-input"
                  value={jobFormData.type}
                  onChange={(e) =>
                    setJobFormData({ ...jobFormData, type: e.target.value })
                  }
                >
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="internship">Stage / Alternance</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
              <div>
                <label className="form-label">Description du poste*</label>
                <textarea
                  required
                  className="form-input"
                  rows={5}
                  value={jobFormData.description}
                  onChange={(e) =>
                    setJobFormData({
                      ...jobFormData,
                      description: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label className="form-label">Email de contact</label>
                  <input
                    type="email"
                    className="form-input"
                    value={jobFormData.contact_email}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        contact_email: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Lien externe (Appliquer)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={jobFormData.application_url}
                    onChange={(e) =>
                      setJobFormData({
                        ...jobFormData,
                        application_url: e.target.value,
                      })
                    }
                    placeholder="https://"
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="btn"
                  style={{
                    background: "var(--surface-100)",
                    color: "var(--surface-800)",
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Publier l'offre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
