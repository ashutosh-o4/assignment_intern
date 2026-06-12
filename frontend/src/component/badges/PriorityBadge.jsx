import "./Badges.css";

export function PriorityBadge({ priority }) {
  const normalizedPriority = (priority || "").toUpperCase();
  
  let typeClass = "badge-priority-low"; // default
  if (normalizedPriority === "MEDIUM") typeClass = "badge-priority-medium";
  if (normalizedPriority === "HIGH") typeClass = "badge-priority-high";

  return (
    <span className={`badge ${typeClass}`}>
      {normalizedPriority}
    </span>
  );
}
