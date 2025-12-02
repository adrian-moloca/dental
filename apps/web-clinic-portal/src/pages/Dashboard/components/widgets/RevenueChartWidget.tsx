/**
 * RevenueChart Widget
 *
 * Simple revenue overview chart using ApexCharts.
 */

import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { WidgetWrapper } from './WidgetWrapper';
import type { ApexOptions } from 'apexcharts';

interface RevenueChartWidgetProps {
  editMode?: boolean;
}

// Mock revenue data
const MOCK_REVENUE_DATA = [
  { month: 'Ian', revenue: 28000 },
  { month: 'Feb', revenue: 32000 },
  { month: 'Mar', revenue: 29000 },
  { month: 'Apr', revenue: 35000 },
  { month: 'Mai', revenue: 38000 },
  { month: 'Iun', revenue: 41000 },
  { month: 'Iul', revenue: 39000 },
  { month: 'Aug', revenue: 36000 },
  { month: 'Sep', revenue: 42000 },
  { month: 'Oct', revenue: 45000 },
  { month: 'Nov', revenue: 43000 },
  { month: 'Dec', revenue: 48000 },
];

export function RevenueChartWidget({ editMode = false }: RevenueChartWidgetProps) {
  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'area',
        height: 280,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      colors: ['#3b82f6'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
      xaxis: {
        categories: MOCK_REVENUE_DATA.map((d) => d.month),
        labels: {
          style: {
            fontSize: '12px',
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => `${(value / 1000).toFixed(0)}k RON`,
          style: {
            fontSize: '12px',
          },
        },
      },
      tooltip: {
        y: {
          formatter: (value) => `${value.toLocaleString('ro-RO')} RON`,
        },
      },
      grid: {
        borderColor: '#e0e0e0',
        strokeDashArray: 3,
      },
    }),
    []
  );

  const series = useMemo(
    () => [
      {
        name: 'Venituri',
        data: MOCK_REVENUE_DATA.map((d) => d.revenue),
      },
    ],
    []
  );

  const totalRevenue = MOCK_REVENUE_DATA.reduce((sum, d) => sum + d.revenue, 0);
  const avgRevenue = totalRevenue / MOCK_REVENUE_DATA.length;
  const currentMonth = MOCK_REVENUE_DATA[MOCK_REVENUE_DATA.length - 1].revenue;
  const growthRate =
    ((currentMonth - MOCK_REVENUE_DATA[MOCK_REVENUE_DATA.length - 2].revenue) /
      MOCK_REVENUE_DATA[MOCK_REVENUE_DATA.length - 2].revenue) *
    100;

  return (
    <WidgetWrapper
      id="revenueChart"
      title="Venituri Lunare"
      icon="ti ti-chart-line"
      editMode={editMode}
    >
      <div className="row g-3 mb-3">
        <div className="col-4">
          <div className="text-center">
            <small className="text-muted d-block">Total Anual</small>
            <h5 className="mb-0 text-primary">
              {(totalRevenue / 1000).toFixed(0)}k RON
            </h5>
          </div>
        </div>
        <div className="col-4">
          <div className="text-center">
            <small className="text-muted d-block">Media Lunara</small>
            <h5 className="mb-0 text-success">
              {(avgRevenue / 1000).toFixed(0)}k RON
            </h5>
          </div>
        </div>
        <div className="col-4">
          <div className="text-center">
            <small className="text-muted d-block">Crestere</small>
            <h5 className={`mb-0 ${growthRate >= 0 ? 'text-success' : 'text-danger'}`}>
              {growthRate >= 0 ? '+' : ''}
              {growthRate.toFixed(1)}%
            </h5>
          </div>
        </div>
      </div>

      <div className="revenue-chart">
        <ReactApexChart options={chartOptions} series={series} type="area" height={280} />
      </div>
    </WidgetWrapper>
  );
}

export default RevenueChartWidget;
