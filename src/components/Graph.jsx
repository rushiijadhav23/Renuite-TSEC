import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', total: 40, highProbable: 15 },
  { month: 'Feb', total: 35, highProbable: 12 },
  { month: 'Mar', total: 45, highProbable: 20 },
  { month: 'Apr', total: 30, highProbable: 10 },
  { month: 'May', total: 50, highProbable: 25 },
  { month: 'Jun', total: 42, highProbable: 18 },
];

export default function Graph() {
  return (
    <div className="h-[400px] bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Missing Persons Statistics</h2>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" name="Total Missing" />
          <Area type="monotone" dataKey="highProbable" stroke="#82ca9d" fill="#82ca9d" name="High Probability Zone" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}