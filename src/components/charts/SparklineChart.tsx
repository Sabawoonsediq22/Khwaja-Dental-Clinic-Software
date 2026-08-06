import React from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface SparklineChartProps {
  data: { day: string; value: number }[];
  color?: string;
  height?: number;
}

const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color = "#0d9488",
  height = 56,
}) => {
  const allZero = data.every((d) => d.value === 0);
  if (allZero || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-[10px] text-gray-400 dark:text-gray-500"
        style={{ height }}
      >
        No data this month
      </div>
    );
  }

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: "100%",
      sparkline: { enabled: true },
      toolbar: { show: false },
      background: "transparent",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 600,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
      lineCap: "round",
    },
    colors: [color],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.35,
        opacityFrom: 0.35,
        opacityTo: 0.0,
        stops: [0, 100],
      },
    },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: false,
    },
    grid: { show: false },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      theme: "light",
      style: { fontSize: "11px" },
      y: { formatter: (val: number) => String(val) },
      marker: { show: false },
    },
    markers: {
      size: 0,
      hover: {
        size: 3,
        sizeOffset: 2,
      },
    },
  };

  const series = [
    {
      name: "value",
      data: data.map((d) => d.value),
    },
  ];

  return (
    <div className="w-full" style={{ height }}>
      <Chart
        options={options}
        series={series}
        type="area"
        height="100%"
      />
    </div>
  );
};

export default SparklineChart;
