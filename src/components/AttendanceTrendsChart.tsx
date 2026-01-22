import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChartData {
  week: number;
  count: number;
  title: string;
}

export default function AttendanceTrendsChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    const { data: sessions } = await supabase
      .from('class_sessions')
      .select('id, week_number, chapter_title')
      .order('week_number', { ascending: true });

    if (sessions) {
      const chartData = await Promise.all(
        sessions.map(async (session) => {
          const { count } = await supabase
            .from('attendance_records')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          return {
            week: session.week_number,
            count: count || 0,
            title: session.chapter_title
          };
        })
      );

      setData(chartData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center text-slate-500">Loading chart...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Attendance Trends
        </h3>
        <div className="text-center text-slate-500 py-8">
          No data available yet
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 60, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const xScale = (week: number) => {
    const minWeek = Math.min(...data.map(d => d.week));
    const maxWeek = Math.max(...data.map(d => d.week));
    const range = maxWeek - minWeek || 1;
    return padding.left + ((week - minWeek) / range) * innerWidth;
  };

  const yScale = (count: number) => {
    return padding.top + innerHeight - (count / maxCount) * innerHeight;
  };

  const pathData = data
    .map((d, i) => {
      const x = xScale(d.week);
      const y = yScale(d.count);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        Attendance Trends
      </h3>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          style={{ maxWidth: '800px' }}
        >
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((d) => (
            <g key={d.week}>
              <circle
                cx={xScale(d.week)}
                cy={yScale(d.count)}
                r="6"
                fill="#3b82f6"
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={xScale(d.week)}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                className="text-xs fill-slate-600"
              >
                Week {d.week}
              </text>
              <text
                x={xScale(d.week)}
                y={yScale(d.count) - 15}
                textAnchor="middle"
                className="text-sm fill-slate-900 font-semibold"
              >
                {d.count}
              </text>
            </g>
          ))}

          <line
            x1={padding.left}
            y1={padding.top + innerHeight}
            x2={padding.left + innerWidth}
            y2={padding.top + innerHeight}
            stroke="#cbd5e1"
            strokeWidth="2"
          />

          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + innerHeight}
            stroke="#cbd5e1"
            strokeWidth="2"
          />

          <text
            x={padding.left - 35}
            y={padding.top + innerHeight / 2}
            textAnchor="middle"
            className="text-xs fill-slate-600"
            transform={`rotate(-90, ${padding.left - 35}, ${padding.top + innerHeight / 2})`}
          >
            Students
          </text>
        </svg>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.map((d) => (
          <div
            key={d.week}
            className="bg-slate-50 rounded-lg p-3 border border-slate-200"
          >
            <div className="text-xs text-slate-500 mb-1">Week {d.week}</div>
            <div className="text-sm font-semibold text-slate-900 line-clamp-2">
              {d.title}
            </div>
            <div className="text-xs text-slate-600 mt-1">{d.count} students</div>
          </div>
        ))}
      </div>
    </div>
  );
}
