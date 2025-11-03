import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const pieData = [
  { name: "Google Drive", value: 45.2, color: "#3B82F6" },
  { name: "Gmail", value: 23.8, color: "#EF4444" },
  { name: "Photos", value: 67.5, color: "#10B981" },
  { name: "Mobile Backup", value: 12.3, color: "#A855F7" },
];

const usageTrendData = [
  { month: "Jan", drive: 35, gmail: 20, photos: 55, mobile: 8 },
  { month: "Feb", drive: 38, gmail: 21, photos: 58, mobile: 9 },
  { month: "Mar", drive: 40, gmail: 22, photos: 61, mobile: 10 },
  { month: "Apr", drive: 42, gmail: 22.5, photos: 63, mobile: 11 },
  { month: "May", drive: 43, gmail: 23, photos: 65, mobile: 11.5 },
  { month: "Jun", drive: 45.2, gmail: 23.8, photos: 67.5, mobile: 12.3 },
];

const cleanupImpactData = [
  { month: "Jan", cleaned: 2.3 },
  { month: "Feb", cleaned: 3.1 },
  { month: "Mar", cleaned: 1.8 },
  { month: "Apr", cleaned: 4.2 },
  { month: "May", cleaned: 3.5 },
  { month: "Jun", cleaned: 5.1 },
];

 function StorageCharts() {
  return (
    <Tabs defaultValue="distribution" className="w-full">
      <TabsList className="grid w-full sm:w-auto grid-cols-3">
        <TabsTrigger value="distribution">Distribution</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="cleanup">Cleanup Impact</TabsTrigger>
      </TabsList>

      <TabsContent value="distribution" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Storage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)} GB`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="trends" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>6-Month Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={usageTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'GB', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${value} GB`} />
                <Legend />
                <Line type="monotone" dataKey="drive" stroke="#3B82F6" name="Google Drive" />
                <Line type="monotone" dataKey="gmail" stroke="#EF4444" name="Gmail" />
                <Line type="monotone" dataKey="photos" stroke="#10B981" name="Photos" />
                <Line type="monotone" dataKey="mobile" stroke="#A855F7" name="Mobile" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cleanup" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Cleanup Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={cleanupImpactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'GB Cleaned', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${value} GB`} />
                <Bar dataKey="cleaned" fill="#10B981" name="Storage Cleaned" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
export default StorageCharts;