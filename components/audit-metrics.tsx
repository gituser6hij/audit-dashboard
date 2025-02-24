import React from 'react';
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
  // Calculate statistics with proper typing
  const severityCounts = audits.reduce((acc: SeverityCounts, audit) => {
    acc[audit.severity] = (acc[audit.severity] || 0) + 1;
    return acc;
  }, {});

  const chartData: ChartDataItem[] = Object.entries(severityCounts).map(([severity, count]) => ({
    severity,
    count,
  }));

  // Calculate total findings
  const totalFindings = audits.length;



  const severityColors = {
    High: '#FF4560', // Red
    Medium: '#00E396', // Green
    Low: '#008FFB', // Blue
  };
  
  const pieChartData = Object.entries(severityCounts).map(([severity, count]) => ({
    name: severity,
    value: count,
    color: severityColors[severity as keyof typeof severityColors],
  }));
  
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Audits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{audits.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>High Severity Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {severityCounts['High'] || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              N/A
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Findings by Severity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="severity" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#8884d8"
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
    <CardHeader>
      <CardTitle>Severity Distribution</CardTitle>
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
              fill="#8884d8"
              label
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
    </div>
  );
};

export default AuditMetrics;