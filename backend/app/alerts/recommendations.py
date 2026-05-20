def budget_anomaly_hint(allocated_crore: float, spent_crore: float) -> str:
    if allocated_crore <= 0:
        return "Invalid budget configuration"
    utilization = (spent_crore / allocated_crore) * 100
    if utilization > 92:
        return "High budget utilization detected. Initiate spend audit and completion verification."
    if utilization < 45:
        return "Low budget utilization detected. Review execution delays and procurement bottlenecks."
    return "Budget utilization is healthy. Continue milestone-based monitoring."
