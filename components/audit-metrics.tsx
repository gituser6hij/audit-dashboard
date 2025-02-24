import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

interface Audit {
  id: string;
  contract: string;
  findings: string;
  severity: "Low" | "Medium" | "High";
  created_at: string;
}

interface SeverityCounts {
  [key: string]: number;
}

interface ChartDataItem {
  severity: string;
  count: number;
}

const AuditMetrics = ({ audits }: { audits: Audit[] }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Check theme on mount
    checkTheme();
    
    // Setup a mutation observer to watch for class changes on html element
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' && 
          mutation.attributeName === 'class'
        ) {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  // Calculate statistics with proper typing
  const severityCounts = audits.reduce((acc: SeverityCounts, audit) => {
    acc[audit.severity] = (acc[audit.severity] || 0) + 1;
    return acc;
  }, {});

  const chartData: ChartDataItem[] = Object.entries(severityCounts).map(([severity, count]) => ({
    severity,
    count,
  }));

  // Theme-aware color palettes
  const lightModeColors = {
    High: '#EF4444', // Red
    Medium: '#F97316', // Orange
    Low: '#22C55E', // Green
    barFill: '#8884d8', // Purple for bar chart
    text: '#1F2937', // Dark text
    grid: '#E5E7EB', // Light gray grid
  };
  
  const darkModeColors = {
    High: '#F87171', // Lighter red
    Medium: '#FB923C', // Lighter orange
    Low: '#4ADE80', // Lighter green
    barFill: '#A78BFA', // Lighter purple for bar chart
    text: '#F9FAFB', // Light text
    grid: '#374151', // Darker grid
  };
  
  const colors = isDarkMode ? darkModeColors : lightModeColors;

  // Create pie chart data with theme-aware colors
  const pieChartData = Object.entries(severityCounts).map(([severity, count]) => ({
    name: severity,
    value: count,
    color: colors[severity as keyof typeof colors],
  }));
  
  // Custom tooltip styles
  const customTooltipStyle = {
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '8px 12px',
    color: isDarkMode ? '#F9FAFB' : '#1F2937',
    boxShadow: isDarkMode 
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.4)' 
      : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={customTooltipStyle}>
          {label && <p className="font-medium">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.payload.color || entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Total Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold dark:text-gray-100">{audits.length}</p>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">High Severity Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: colors.High }}>
              {severityCounts['High'] || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: colors.Low }}>
              N/A
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Findings by Severity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="severity" 
                  tick={{ fill: isDarkMode ? '#F9FAFB' : '#1F2937' }}
                  stroke={isDarkMode ? '#F9FAFB' : '#1F2937'}
                />
                <YAxis 
                  tick={{ fill: isDarkMode ? '#F9FAFB' : '#1F2937' }}
                  stroke={isDarkMode ? '#F9FAFB' : '#1F2937'}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill={colors.barFill}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[entry.severity as keyof typeof colors]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Severity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditMetrics;