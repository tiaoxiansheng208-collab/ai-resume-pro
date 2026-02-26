import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from 'recharts';

interface IcebergChartProps {
  upfront: number;
  hidden: number;
}

export function IcebergChart({ upfront, hidden }: IcebergChartProps) {
  const data = [
    {
      name: '显性成本',
      value: upfront,
      type: 'upfront'
    },
    {
      name: '隐性成本 (5年)',
      value: -hidden, // Negative to show underwater
      type: 'hidden'
    }
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumSignificantDigits: 3 }).format(Math.abs(val));

  return (
    <div className="h-64 w-full relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-blue-900/20 pointer-events-none" />
      
      {/* Water Line */}
      <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-blue-400/50 z-10 flex items-center">
        <span className="text-[10px] text-blue-400 bg-background px-1 ml-2">水面 (支出线)</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          stackOffset="sign"
        >
          <XAxis dataKey="name" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border border-border p-2 rounded shadow-xl text-xs font-mono">
                    <p className="text-muted-foreground">{payload[0].payload.name}</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(payload[0].value as number)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine y={0} stroke="#666" />
          <Bar dataKey="value" barSize={60}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.value > 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} 
                fillOpacity={entry.value > 0 ? 0.8 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="flex justify-between px-12 text-xs font-mono text-muted-foreground mt-2">
        <span>显性 (首付/投入)</span>
        <span className="text-destructive">隐性 (总持有成本 - 投入)</span>
      </div>
    </div>
  );
}
