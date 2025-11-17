import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface EventCapacityChartProps {
  availabilityData: {
    ticket_type: string;
    capacity_sold: number;
    maximun_capacity: number;
  }[];
}

const EventCapacityChart: React.FC<EventCapacityChartProps> = ({ availabilityData }) => {
  const options: ApexOptions = {
    colors: ['#465fff', '#ff7f50'],
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'bar',
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 5,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: availabilityData.map((d) => d.ticket_type),
    },
    yaxis: {
      title: {
        text: 'Tickets',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} tickets`,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
  };

  const series = [
    {
      name: 'Vendidos',
      data: availabilityData.map((d) => d.capacity_sold),
    },
    {
      name: 'Disponibles',
      data: availabilityData.map((d) => d.maximun_capacity - d.capacity_sold),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h2 className="text-lg font-semibold mb-4">Capacidad del Evento</h2>
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default EventCapacityChart;
