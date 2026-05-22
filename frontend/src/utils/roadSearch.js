
export const searchRoadData = (query, roads) => {
  const lowerQuery = query.toLowerCase();

  return roads.filter((road) => {
    return (
      road.roadName.toLowerCase().includes(lowerQuery) ||
      road.contractor.toLowerCase().includes(lowerQuery) ||
      road.area.toLowerCase().includes(lowerQuery) ||
      road.status.toLowerCase().includes(lowerQuery) ||
      road.condition.toLowerCase().includes(lowerQuery)
    );
  });
};

export const getAnalytics = (roads) => {
  return {
    totalRoads: roads.length,
    poorRoads: roads.filter((r) => r.condition === "Poor").length,
    activeMaintenance: roads.filter((r) =>
      r.status.includes("Maintenance")
    ).length,
    totalComplaints: roads.reduce((acc, road) => acc + road.complaints, 0),
  };
};
