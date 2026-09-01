"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

export function UsersGrowthChart({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Users",
            data: values,
            borderColor: "#6C5CE7",
            backgroundColor: "rgba(108,92,231,0.15)",
            tension: 0.35,
            fill: true,
            pointRadius: 3,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      }}
    />
  );
}

export function RoleDistributionChart({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  return (
    <Doughnut
      data={{
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: ["#EC4899", "#3B82F6", "#FBBF24"],
            borderWidth: 0,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      }}
    />
  );
}
