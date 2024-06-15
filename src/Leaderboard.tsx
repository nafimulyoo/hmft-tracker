import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './components/ui/table';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Data = {
  total: Array<Array<string | number>>,
  monthly: {
    [key: string]: Array<Array<string | number | boolean>>
  }
};

export default function Leaderboard() {
  const [data, setData] = useState<Data>({ total: [], monthly: {} });
  const [selectedMonth, setSelectedMonth] = useState<string>('06/2024');
  const [viewOption, setViewOption] = useState<string>('total');
  const [sortedData, setSortedData] = useState<Array<Array<string | number | boolean>>>([]);
  const [topLeader, setTopLeader] = useState<string>('');
  const [dialogData, setDialogData] = useState<Array<{ name: string, percentage: string }> | null>(null);
  const [dialogTitle, setDialogTitle] = useState<string>('');

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

  const handleDialogOpen = (name: string) => {
    const personMonthlyData = Object.entries(data.monthly).map(([month, entries]) => {
      const personData = entries.find(entry => entry[0] === name);
      return personData ? { name: month, percentage: ((personData[2] as number) * 100).toFixed(2)} : null;
    }).filter(entry => entry !== null) as Array<{ name: string, percentage: string }>;
    setDialogData(personMonthlyData);
    setDialogTitle(name);
  };

  

  const handleDialogClose = () => {
    setDialogData(null);
    setDialogTitle('');
  };

  if (!data.total.length || !Object.keys(data.monthly).length) {
    return <div>Loading...</div>;
  }

  const top7History = getTop7History(data.monthly);
  const topLeaderPerformance = getTopLeaderPerformance(data.total, data.monthly, topLeader);

  return (
    <div className="flex flex-col w-full min-h-screen">
 <header className="bg-gray-100 dark:bg-gray-900 py-6 px-4 md:px-6 flex justify-between items-center">
      <div className="flex items-center">
        <img 
          src="https://multisite.itb.ac.id/hmft/wp-content/uploads/sites/456/2022/12/Logo-HMFT-768x682.png" 
          alt="HMFT Logo" 
          className="h-10 w-10 mr-4" 
        />
        <div className="container mx-auto">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">HMFT-ITB Attendance Leaderboard</h1>
        </div>
      </div>
      <a target="_blank" rel="noreferrer" href="https://github.com/nafimulyoo/hmft-tracker">
        <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 py-2 w-9 px-0">
          <svg viewBox="0 0 438.549 438.549" className="h-8 w-8">
            <path fill="currentColor" d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"></path>
          </svg>
          <span className="sr-only">GitHub</span>
        </div>
      </a>
    </header>
      <main className="flex-1 py-8 px-4 md:px-6">
        <div className="container mx-auto grid gap-8">
          <div className="mb-4 flex justify-between">
            <Select value={viewOption} onValueChange={setViewOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="View Option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Total</SelectItem>
                <SelectItem value="monthly">Per Month</SelectItem>
              </SelectContent>
            </Select>
            {viewOption === 'monthly' && (
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(data.monthly).map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Card>
            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>{viewOption === 'total' ? 'Total Attendance' : 'Monthly Attendance'}</TableHead>
                    <TableHead>{viewOption === 'total' ? 'Total Percentage' : 'Monthly Percentage'}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row[0]}</TableCell>
                      <TableCell>{row[1]}</TableCell>
                      <TableCell>
                        <Progress value={(row[2] as number) * 100} />
                      </TableCell>
                      <TableCell>
                        {((row[2] as number) * 100).toFixed(2) + '%'}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => handleDialogOpen(row[0] as string)}>Details</Button>
                          </DialogTrigger>
                          {dialogData && (
                            <DialogContent className="width-[1000rem]">
                              <DialogHeader>
                                <DialogTitle>{dialogTitle} Monthly Attendance</DialogTitle>
                                <DialogDescription>
                                  Attendance details for each month.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="h-64 w-full">
                                <BarChart data={dialogData} />
                              </div>
                              <DialogFooter className="sm:justify-start">
                                <DialogClose asChild>
                                  <Button type="button" variant="secondary" onClick={handleDialogClose}>
                                    Close
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          )}
                        </Dialog>
                      </TableCell>
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
      <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left text-lg">
          {"Built by "} 
          <a href="https://www.instagram.com/hmft_itb/" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
            Talent Management BP HMFT-ITB 2024/2025 #RuangBerproses
          </a>.
          The source code is available on{" "}
          <a href="https://github.com/nafimulyoo/hmft-tracker" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
            GitHub
          </a>.
        </p>
      </div>
    </footer>
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
      leaderPerformance.push({ name: month, percentage: ((leaderData[2] as number) * 100).toFixed(2) });
    }
  }
  console.log(leaderPerformance);
  return leaderPerformance;
}

function BarChart({ data, ...props }: { data: Array<{ name: string, percentage: string }> }) {
  return (
    <div {...props} className="aspect-[9/4]">
      <ResponsiveBar
        data={data}
        keys={["percentage"]}
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
