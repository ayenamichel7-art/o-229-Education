import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  MoreVertical,
  Shirt,
  Book,
  Box,
} from "lucide-react";
import { apiClient } from "../api/apiClient";
import toast from "react-hot-toast";

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock_quantity: number;
  min_stock_level: number;
  unit: string;
  unit_price: number;
}

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/inventory");
      setItems(res.data);
    } catch (err) {
      toast.error("Erreur chargement inventaire");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", label: "Tout", icon: Package },
    { id: "uniform", label: "Uniformes", icon: Shirt },
    { id: "supply", label: "Fournitures", icon: Book },
    { id: "furniture", label: "Mobilier", icon: Box },
  ];

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock_quantity <= 0)
      return { label: "Rupture", color: "#EF4444", bg: "#FEF2F2" };
    if (item.stock_quantity <= item.min_stock_level)
      return { label: "Bas", color: "#F59E0B", bg: "#FFFBEB" };
    return { label: "En Stock", color: "#10B981", bg: "#ECFDF5" };
  };

  return (
    <div className="erp-page animate-fade-in">
      <header className="page-header" style={{ marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>
            Inventaire & Stocks
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Gérez les fournitures, uniformes et immobilisations de
            l'établissement.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className="btn btn-secondary"
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            <ArrowUpRight size={18} /> Approvisionner
          </button>
          <button
            className="btn btn-primary"
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            <Plus size={18} /> Nouvel Article
          </button>
        </div>
      </header>

      {/* Categories Horizontal */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2.5rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              borderRadius: "14px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              background:
                activeCategory === cat.id ? "var(--gradient-primary)" : "white",
              color: activeCategory === cat.id ? "white" : "#64748B",
              fontWeight: 600,
              boxShadow:
                activeCategory === cat.id
                  ? "0 10px 15px -3px rgba(59,130,246,0.3)"
                  : "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <cat.icon size={18} /> {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center" }}>
          Chargement...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredItems.length === 0 ? (
            <div
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "4rem",
                background: "white",
                borderRadius: "20px",
              }}
            >
              <Package
                size={48}
                style={{ margin: "0 auto 1rem", color: "#CBD5E1" }}
              />
              <p style={{ color: "var(--text-muted)" }}>
                Aucun article trouvé dans cette catégorie.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const status = getStockStatus(item);
              return (
                <div
                  key={item.id}
                  className="glass-card hover-scale"
                  style={{
                    background: "white",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {item.sku || "SANS SKU"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: "20px",
                        background: status.bg,
                        color: status.color,
                      }}
                    >
                      {status.label}
                    </div>
                  </div>

                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {item.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    Catégorie: {item.category}
                  </p>

                  <div
                    style={{
                      background: "#F8FAFC",
                      padding: "1.25rem",
                      borderRadius: "16px",
                      marginBottom: "1.5rem",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem", color: "#64748B" }}>
                        Quantité
                      </span>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          color: "#1E293B",
                        }}
                      >
                        {item.stock_quantity}{" "}
                        <small style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                          {item.unit}
                        </small>
                      </span>
                    </div>
                    <div
                      style={{
                        height: "6px",
                        width: "100%",
                        background: "#E2E8F0",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min((item.stock_quantity / (item.min_stock_level * 3)) * 100, 100)}%`,
                          background: status.color,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Prix Unitaire
                      </div>
                      <div style={{ fontWeight: 700, color: "var(--primary)" }}>
                        {item.unit_price} CFA
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "8px", border: "1px solid #E2E8F0" }}
                      >
                        <ArrowDownLeft size={16} />
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "8px", border: "1px solid #E2E8F0" }}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Alert Banner for Low Stock */}
      {items.some((i) => i.stock_quantity <= i.min_stock_level) && (
        <div
          style={{
            marginTop: "2.5rem",
            padding: "1.25rem 1.5rem",
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ color: "#F59E0B" }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: "#92400E" }}>
              Alerte Réapprovisionnement :
            </span>
            <span
              style={{
                marginLeft: "6px",
                color: "#B45309",
                fontSize: "0.9rem",
              }}
            >
              Plusieurs articles sont en dessous du seuil critique de stock.
            </span>
          </div>
          <button
            className="btn btn-primary"
            style={{
              background: "#F59E0B",
              border: "none",
              fontSize: "0.8rem",
              padding: "8px 16px",
            }}
          >
            Voir les alertes
          </button>
        </div>
      )}
    </div>
  );
};
