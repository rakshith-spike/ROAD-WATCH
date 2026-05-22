
export const detectIntent = (message) => {
  const query = message.toLowerCase();

  if (query.includes("contractor")) return "contractor";
  if (query.includes("cost")) return "cost";
  if (query.includes("complaint")) return "complaints";
  if (query.includes("condition")) return "condition";
  if (query.includes("maintenance")) return "maintenance";
  if (query.includes("traffic")) return "traffic";
  if (query.includes("danger")) return "risk";

  return "general";
};
