import React from "react";


/**
 * AlertCard
 * props.alert = {
 *   region, severity, rainfall, waterLevel, affected, message
 * }
 */

function AlertCard({ alert }) {
  if (!alert) return null;

  const sev = (alert.severity || "LOW").toLowerCase();

  return (
    <div className={`alert-card ${sev}`}>
      <div className="alert-header">
        <h3 className="alert-title">{alert.region}</h3>
        <div className={`severity-pill ${sev}`}>{alert.severity}</div>
      </div>

      <div className="alert-message">{alert.message}</div>

      <div className="alert-meta">
        <div className="meta-item">
          <div className="meta-label">Rainfall</div>
          <div className="meta-value">{alert.rainfall ?? "—"} mm</div>
        </div>

        <div className="meta-item">
          <div className="meta-label">Water Level</div>
          <div className="meta-value">{alert.waterLevel ?? "—"} m</div>
        </div>

        <div className="meta-item">
          <div className="meta-label">Affected</div>
          <div className="meta-value">{alert.affected ?? "—"}</div>
        </div>
      </div>

      <div className="alert-footer">
        <span>Status: Active</span>
      </div>
    </div>
  );
}

export default AlertCard;
