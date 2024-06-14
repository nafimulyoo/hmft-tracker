import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './components/ui/table';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';

type Data = {
  total: Array<Array<string | number>>,
  monthly: {
    [key: string]: Array<Array<string | number | boolean>>
  }
};

export default function Leaderboard() {
  const [data, setData] = useState<Data>({ total: [], monthly: {} });
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [viewOption, setViewOption] = useState<string>('total');
  const [sortedData, setSortedData] = useState<Array<Array<string | number | boolean>>>([]);
  const [topLeader, setTopLeader] = useState<string>('');

  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycbwv6vEsCwDh0gD1BBw0AUNCiNAe3Y_xdi-ZzTawDj4b76WsbssPBUEdDpDCf7MVIMoR/exec?action=get')
      .then(response => response.json())
      .then((data: Data) => {
        setData(data);
        const sorted = data.total.slice(1).sort((a: any, b: any) => b[1] - a[1]);
        setSortedData(sorted);
        setSelectedMonth(Object.keys(data.monthly)[0]);
        if (sorted.length > 0) {
          setTopLeader(sorted[0][0] as string);
        }
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleViewOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewOption(e.target.value);
  };

  useEffect(() => {
    if (viewOption === 'total') {
      setSortedData(data.total.slice(1).sort((a: any, b: any) => b[1] - a[1]));
    } else {
      const monthData = data.monthly[selectedMonth];
      if (monthData) {
        setSortedData(monthData.sort((a: any, b:any) => (b[1] as number) - (a[1] as number)));
      }
    }
  }, [viewOption, selectedMonth, data]);

  if (!data.total.length || !Object.keys(data.monthly).length) {
    return <div>Loading...</div>;
  }

  const top7History = getTop7History(data.monthly);
  const topLeaderPerformance = getTopLeaderPerformance(data.total, data.monthly, topLeader);

  return (
    <div className="flex flex-col w-full min-h-screen">
      <header className="bg-gray-100 dark:bg-gray-900 py-6 px-4 md:px-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Leaderboard</h1>
        </div>
      </header>
      <main className="flex-1 py-8 px-4 md:px-6">
        <div className="container mx-auto grid gap-8">
          <div className="mb-4 flex justify-between">
            <select value={viewOption} onChange={handleViewOptionChange} className="p-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded">
              <option value="total">Total</option>
              <option value="monthly">Per Month</option>
            </select>
            {viewOption === 'monthly' && (
              <select value={selectedMonth} onChange={handleMonthChange} className="p-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded">
                {Object.keys(data.monthly).map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            )}
          </div>
          <Card>
            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>{viewOption === 'total' ? 'Kehadiran Total' : 'Kehadiran Bulanan'}</TableHead>
                    <TableHead>{viewOption === 'total' ? 'Persentase Total' : 'Persentase Bulanan'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row[0]}</TableCell>
                      <TableCell>{row[1]}</TableCell>
                      <TableCell>{viewOption === 'total' ? (row[2] as number).toFixed(2) + '%' : ((row[2] as number) * 100).toFixed(2) + '%'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Overall Scores (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart data={top7History} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Monthly Leader Performance (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-center">
                  <h2 className="text-xl font-bold">{topLeader}</h2>
                </div>
                <BarChart data={topLeaderPerformance} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function getTop7History(monthlyData: { [key: string]: Array<Array<string | number | boolean>> }) {
  const months = Object.keys(monthlyData);
  const top7History: { [key: string]: Array<{ x: string, y: number }> } = {};

  months.forEach(month => {
    const monthData = monthlyData[month];
    monthData.sort((a, b) => (b[2] as number) - (a[2] as number)); // Sort by 'Total'

    monthData.slice(0, 7).forEach(row => {
      if (!top7History[row[0] as string]) {
        top7History[row[0] as string] = [];
      }
      top7History[row[0] as string].push({ x: month, y: (row[2] as number * 100) });
    });
  });

  return Object.keys(top7History).map(key => ({
    id: key,
    data: top7History[key],
  }));
}

function getTopLeaderPerformance(totalData: Array<Array<string | number>>, monthlyData: { [key: string]: Array<Array<string | number | boolean>> }, topLeader: string) {
  if (!totalData.length || !topLeader) return [];
  
  const leaderPerformance = [];

  for (const [month, data] of Object.entries(monthlyData)) {
    const leaderData = data.find(row => row[0] === topLeader);
    if (leaderData) {
      leaderPerformance.push({ name: month, count: ((leaderData[2] as number) * 100).toFixed(2) });
    }
  }

  return leaderPerformance;
}

function BarChart({ data, ...props }: { data: Array<{ name: string, count: string }> }) {
  return (
    <div {...props}  className="aspect-[9/4]">
      <ResponsiveBar
        data={data}
        keys={["count"]}
        indexBy="name"
        margin={{ top: 0, right: 0, bottom: 40, left: 40 }}
        padding={0.3}
        colors={["#2563eb"]}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 4,
          tickPadding: 16,
        }}
        
        gridYValues={4}
        theme={{
          tooltip: {
            chip: {
              borderRadius: "9999px",
            },
            container: {
              fontSize: "12px",
              textTransform: "capitalize",
              borderRadius: "6px",
            },
          },
          grid: {
            line: {
              stroke: "#f3f4f6",
            },
          },
        }}
        tooltipLabel={({ id }) => `${id}`}
        enableLabel={false}
        role="application"
      />
    </div>
  );
}

function LineChart({ data, ...props }: { data: Array<{ id: string, data: Array<{ x: string, y: number }> }> }) {
  return (
    <div {...props} className="aspect-[9/4]">
      <ResponsiveLine
        data={data}
        margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear' }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Month',
          legendOffset: 36,
          legendPosition: 'middle'
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Score',
          legendOffset: -40,
          legendPosition: 'middle'
        }}
        colors={{ scheme: 'nivo' }}
        pointSize={6}
        pointBorderWidth={2}
        pointLabelYOffset={-12}
        useMesh={true}
        enableSlices="x"
        enableArea={false}
        enableGridX={false}
        enableGridY={true}
        theme={{
          tooltip: {
            chip: {
              borderRadius: '9999px',
            },
            container: {
              fontSize: '12px',
              textTransform: 'capitalize',
              borderRadius: '6px',
            },
          },
          grid: {
            line: {
              stroke: '#f3f4f6',
            },
          },
        }}
        tooltip={({ point }) => (
          <div
            style={{
              background: 'white',
              padding: '5px 10px',
              border: '1px solid #ccc',
            }}
          >
            <strong>{point.serieId}</strong>
            <br />
            {point.data.xFormatted}: {point.data.yFormatted}
          </div>
        )}
        role="application"
      />
    </div>
  );
}

