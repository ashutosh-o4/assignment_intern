import "./Badges.css";

export function StatusBadge({ status }) {
  const normalizedStatus = (status || "").toUpperCase();
  
  let typeClass = "badge-status-todo"; // default
  if (normalizedStatus === "IN_PROGRESS") typeClass = "badge-status-in-progress";
  if (normalizedStatus === "DONE") typeClass = "badge-status-done";

  // Format text: IN_PROGRESS -> In Progress
  const displayLabel = normalizedStatus.replace("_", " ");

  return (
    <span className={`badge ${typeClass}`}>
      {displayLabel}
    </span>
  );
}
