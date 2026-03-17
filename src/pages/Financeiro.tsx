import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  AlertCircle,
  Users,
  CreditCard,
  DollarSign,
  DoorOpen,
  Loader2,
  BarChart3,
  Activity,
} from "lucide-react";
import logo from "@/assets/gymlabz-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFinancialReport,
  getPaymentsByGym,
  getMembersReport,
  getAccessReport,
  getPeakHoursReport,
  getCapacityReport,
  type FinancialReport,
  type Payment,
  type MembersReport,
  type AccessReport,
  type PeakHoursReport,
  type CapacityReport,
} from "@/lib/financial-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

const statusLabels: Record<string, string> = {
  paid: "Pago",
  PENDING: "Pendente",
  pending: "Pendente",
  overdue: "Em atraso",
  COMPLETED: "Concluído",
  FAILED: "Falhou",
  CANCELLED: "Cancelado",
};

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const Financeiro = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("financeiro");
  const [financial, setFinancial] = useState<FinancialReport | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<MembersReport | null>(null);
  const [access, setAccess] = useState<AccessReport | null>(null);
  const [peakHours, setPeakHours] = useState<PeakHoursReport | null>(null);
  const [capacity, setCapacity] = useState<CapacityReport | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const loadTab = useCallback(
    async (tab: string) => {
      if (!token) return;
      setLoading((l) => ({ ...l, [tab]: true }));
      setError(null);
      try {
        switch (tab) {
          case "financeiro": {
            const [fin, pay] = await Promise.all([
              getFinancialReport(token),
              getPaymentsByGym(token, {
                limit: 50,
                offset: 0,
                status: statusFilter || undefined,
              }),
            ]);
            setFinancial(fin);
            setPayments(pay.payments);
            break;
          }
          case "membros":
            setMembers(await getMembersReport(token));
            break;
          case "acesso":
            setAccess(await getAccessReport(token));
            break;
          case "pico":
            setPeakHours(await getPeakHoursReport(token, 30));
            break;
          case "capacidade":
            setCapacity(await getCapacityReport(token));
            break;
        }
      } catch (e: unknown) {
        const msg =
          e && typeof e === "object" && "message" in e
            ? String((e as { message: string }).message)
            : "Erro ao carregar dados";
        setError(msg);
      } finally {
        setLoading((l) => ({ ...l, [tab]: false }));
      }
    },
    [token, statusFilter]
  );

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  const isLoading = loading[activeTab];

  return (
    <div className="w-full">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            Financeiro e Relatórios
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Receitas, métricas e análises da academia
        </p>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full flex-wrap h-auto gap-1">
            <TabsTrigger value="financeiro" className="gap-1.5">
              <DollarSign size={16} />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="membros" className="gap-1.5">
              <Users size={16} />
              Membros
            </TabsTrigger>
            <TabsTrigger value="acesso" className="gap-1.5">
              <DoorOpen size={16} />
              Acesso
            </TabsTrigger>
            <TabsTrigger value="pico" className="gap-1.5">
              <Activity size={16} />
              Horários de Pico
            </TabsTrigger>
            <TabsTrigger value="capacidade" className="gap-1.5">
              <BarChart3 size={16} />
              Capacidade
            </TabsTrigger>
          </TabsList>

          {/* Tab Financeiro */}
          <TabsContent value="financeiro">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={16} className="text-primary" />
                      <span className="text-xs text-muted-foreground">
                        Receita Paga
                      </span>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      {financial ? fmt(financial.summary.paidRevenue) : "—"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard size={16} className="text-amber-500" />
                      <span className="text-xs text-muted-foreground">
                        Pendente
                      </span>
                    </div>
                    <p className="text-lg font-bold text-amber-600">
                      {financial ? fmt(financial.summary.pendingRevenue) : "—"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle size={16} className="text-destructive" />
                      <span className="text-xs text-muted-foreground">
                        Inadimplente
                      </span>
                    </div>
                    <p className="text-lg font-bold text-destructive">
                      {financial ? fmt(financial.summary.overdueRevenue) : "—"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={16} className="text-primary" />
                      <span className="text-xs text-muted-foreground">
                        Receita Total
                      </span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {financial ? fmt(financial.summary.totalRevenue) : "—"}
                    </p>
                  </div>
                </div>

                {/* Gráfico Receita Mensal */}
                {financial?.monthlyRevenueTrend &&
                  financial.monthlyRevenueTrend.length > 0 && (
                    <div className="rounded-xl bg-card border border-border p-5">
                      <h2 className="text-lg font-bold text-foreground mb-4">
                        Receita Mensal (últimos 12 meses)
                      </h2>
                      <ChartContainer
                        config={{
                          revenue: { label: "Receita", color: "hsl(var(--primary))" },
                        }}
                        className="h-[280px]"
                      >
                        <AreaChart
                          data={financial.monthlyRevenueTrend.map((m) => ({
                            month: m.month.slice(5) + "/" + m.month.slice(0, 4),
                            revenue: m.revenue,
                          }))}
                        >
                          <defs>
                            <linearGradient
                              id="fillRevenue"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" tickLine={false} />
                          <YAxis tickFormatter={(v) => fmt(v).replace("R$", "R$ ")} />
                          <ChartTooltip content={<ChartTooltipContent formatter={(v) => fmt(Number(v))} />} />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="hsl(var(--primary))"
                            fill="url(#fillRevenue)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ChartContainer>
                    </div>
                  )}

                {/* Gráfico Receita por Plano */}
                {financial &&
                  Object.keys(financial.revenueByPlan).length > 0 && (
                    <div className="rounded-xl bg-card border border-border p-5">
                      <h2 className="text-lg font-bold text-foreground mb-4">
                        Receita por Plano
                      </h2>
                      <ChartContainer
                        config={Object.fromEntries(
                          Object.keys(financial.revenueByPlan).map((k, i) => [
                            k,
                            { label: k, color: CHART_COLORS[i % CHART_COLORS.length] },
                          ])
                        )}
                        className="h-[280px]"
                      >
                        <RechartsPieChart>
                          <ChartTooltip formatter={(v) => fmt(Number(v))} />
                          <Pie
                            data={Object.entries(financial.revenueByPlan).map(
                              ([name, value], i) => ({
                                name,
                                value,
                                fill: CHART_COLORS[i % CHART_COLORS.length],
                              })
                            )}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {Object.entries(financial.revenueByPlan).map(
                              (_, i) => (
                                <Cell
                                  key={i}
                                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                                />
                              )
                            )}
                          </Pie>
                        </RechartsPieChart>
                      </ChartContainer>
                    </div>
                  )}

                {/* Lista de Pagamentos */}
                <div className="rounded-xl bg-card border border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">
                      Pagamentos
                    </h2>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-sm rounded-lg border border-border bg-background px-3 py-1.5"
                    >
                      <option value="">Todos</option>
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                      <option value="overdue">Em atraso</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    {payments.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-8 text-center">
                        Nenhum pagamento encontrado.
                      </p>
                    ) : (
                      payments.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                p.status === "paid" || p.status === "COMPLETED"
                                  ? "bg-primary/20"
                                  : p.status === "overdue"
                                    ? "bg-destructive/20"
                                    : "bg-amber-500/20"
                              }`}
                            >
                              {p.status === "paid" || p.status === "COMPLETED" ? (
                                <TrendingUp size={18} className="text-primary" />
                              ) : p.status === "overdue" ? (
                                <AlertCircle size={18} className="text-destructive" />
                              ) : (
                                <CreditCard size={18} className="text-amber-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">
                                {p.user
                                  ? `${p.user.firstName} ${p.user.lastName}`
                                  : "—"}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {p.plan?.name ?? "—"} • {fmtDate(p.dueDate)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                p.status === "paid" || p.status === "COMPLETED"
                                  ? "bg-primary/20 text-primary"
                                  : p.status === "overdue"
                                    ? "bg-destructive/20 text-destructive"
                                    : "bg-amber-500/20 text-amber-600"
                              }`}
                            >
                              {statusLabels[p.status] ?? p.status}
                            </span>
                            <span className="text-sm font-bold text-foreground">
                              {fmt(p.amount)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab Membros */}
          <TabsContent value="membros">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : members ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-foreground">
                      {members.summary.totalMembers}
                    </p>
                    <p className="text-xs text-muted-foreground">Total de membros</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-primary">
                      {members.summary.activeMembers}
                    </p>
                    <p className="text-xs text-muted-foreground">Ativos</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-amber-600">
                      {members.summary.newMembersThisMonth}
                    </p>
                    <p className="text-xs text-muted-foreground">Novos este mês</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-destructive">
                      {members.summary.churnRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Taxa de churn</p>
                  </div>
                </div>

                {members.membershipTrends?.length > 0 && (
                  <div className="rounded-xl bg-card border border-border p-5">
                    <h2 className="text-lg font-bold text-foreground mb-4">
                      Crescimento de Membros (últimos 12 meses)
                    </h2>
                    <ChartContainer
                      config={{
                        newMembers: { label: "Novos", color: "hsl(var(--primary))" },
                        netGrowth: { label: "Crescimento líquido", color: "hsl(var(--chart-2))" },
                      }}
                      className="h-[280px]"
                    >
                      <BarChart
                        data={members.membershipTrends.map((m) => ({
                          month: m.month.slice(5) + "/" + m.month.slice(0, 4),
                          newMembers: m.newMembers,
                          netGrowth: m.netGrowth,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tickLine={false} />
                        <YAxis tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="newMembers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="netGrowth" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}

                {Object.keys(members.membersByPlan || {}).length > 0 && (
                  <div className="rounded-xl bg-card border border-border p-5">
                    <h2 className="text-lg font-bold text-foreground mb-4">
                      Membros por Plano
                    </h2>
                    <ChartContainer
                      config={Object.fromEntries(
                        Object.entries(members.membersByPlan || {}).map(([k], i) => [
                          k,
                          { label: k, color: CHART_COLORS[i % CHART_COLORS.length] },
                        ])
                      )}
                      className="h-[260px]"
                    >
                      <BarChart
                        data={Object.entries(members.membersByPlan || {}).map(
                          ([name, value]) => ({ name, value })
                        )}
                        layout="vertical"
                        margin={{ left: 80 }}
                      >
                        <XAxis type="number" tickLine={false} />
                        <YAxis type="category" dataKey="name" width={70} tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground py-12 text-center">
                Nenhum dado disponível.
              </p>
            )}
          </TabsContent>

          {/* Tab Acesso */}
          <TabsContent value="acesso">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : access ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-foreground">
                      {access.summary.totalAccess}
                    </p>
                    <p className="text-xs text-muted-foreground">Total de acessos</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-primary">
                      {access.summary.successfulAccess}
                    </p>
                    <p className="text-xs text-muted-foreground">Acessos concedidos</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-foreground">
                      {access.summary.averageDailyAccess}
                    </p>
                    <p className="text-xs text-muted-foreground">Média/dia</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-foreground">
                      {access.summary.uniqueUsers}
                    </p>
                    <p className="text-xs text-muted-foreground">Usuários únicos</p>
                  </div>
                </div>

                {access.accessTrends?.length > 0 && (
                  <div className="rounded-xl bg-card border border-border p-5">
                    <h2 className="text-lg font-bold text-foreground mb-4">
                      Acessos por Dia
                    </h2>
                    <ChartContainer
                      config={{
                        totalAccess: { label: "Acessos", color: "hsl(var(--primary))" },
                      }}
                      className="h-[280px]"
                    >
                      <AreaChart
                        data={access.accessTrends.map((t) => ({
                          date: t.date?.slice(0, 10) || t.date,
                          totalAccess: t.totalAccess,
                        }))}
                      >
                        <defs>
                          <linearGradient id="fillAccess" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tickLine={false} tickFormatter={(v) => v?.slice(5) || v} />
                        <YAxis tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="totalAccess"
                          stroke="hsl(var(--primary))"
                          fill="url(#fillAccess)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                )}

                {access.peakHours?.length > 0 && (
                  <div className="rounded-xl bg-card border border-border p-5">
                    <h2 className="text-lg font-bold text-foreground mb-4">
                      Horários de Pico
                    </h2>
                    <ChartContainer
                      config={{
                        accessCount: { label: "Acessos", color: "hsl(var(--chart-2))" },
                      }}
                      className="h-[260px]"
                    >
                      <BarChart
                        data={access.peakHours.slice(0, 12).map((p) => ({
                          hour: p.hour,
                          accessCount: p.accessCount,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="hour" tickLine={false} />
                        <YAxis tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="accessCount" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground py-12 text-center">
                Nenhum dado disponível.
              </p>
            )}
          </TabsContent>

          {/* Tab Horários de Pico */}
          <TabsContent value="pico">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : peakHours ? (
              <div className="space-y-6">
                {peakHours.hourlyDistribution?.length > 0 && (
                  <div className="rounded-xl bg-card border border-border p-5">
                    <h2 className="text-lg font-bold text-foreground mb-4">
                      Distribuição por Hora (últimos 30 dias)
                    </h2>
                    <ChartContainer
                      config={{
                        accessCount: { label: "Acessos", color: "hsl(var(--primary))" },
                      }}
                      className="h-[300px]"
                    >
                      <BarChart
                        data={peakHours.hourlyDistribution.map((h) => ({
                          hour: h.hour,
                          accessCount: h.accessCount,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="hour" tickLine={false} />
                        <YAxis tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="accessCount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}

                {peakHours.dailyDistribution?.length > 0 && (
                  <div className="rounded-xl bg-card border border-border p-5">
                    <h2 className="text-lg font-bold text-foreground mb-4">
                      Por Dia da Semana
                    </h2>
                    <ChartContainer
                      config={{
                        totalAccess: { label: "Acessos", color: "hsl(var(--chart-3))" },
                      }}
                      className="h-[260px]"
                    >
                      <BarChart
                        data={peakHours.dailyDistribution.map((d) => ({
                          day: d.dayOfWeek,
                          totalAccess: d.totalAccess,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" tickLine={false} />
                        <YAxis tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="totalAccess" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}

                {peakHours.recommendations?.length > 0 && (
                  <div className="rounded-xl bg-card border border-border p-5">
                    <h2 className="text-lg font-bold text-foreground mb-4">
                      Recomendações
                    </h2>
                    <ul className="space-y-2">
                      {peakHours.recommendations.map((r, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span
                            className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                              r.priority === "high" ? "bg-destructive" : "bg-amber-500"
                            }`}
                          />
                          {r.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground py-12 text-center">
                Nenhum dado disponível.
              </p>
            )}
          </TabsContent>

          {/* Tab Capacidade */}
          <TabsContent value="capacidade">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : capacity ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-foreground">
                      {capacity.currentCapacity.totalMembers}
                    </p>
                    <p className="text-xs text-muted-foreground">Membros atuais</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-foreground">
                      {capacity.currentCapacity.maxCapacity}
                    </p>
                    <p className="text-xs text-muted-foreground">Capacidade máxima</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-primary">
                      {capacity.currentCapacity.utilizationRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Ocupação</p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-2xl font-bold text-foreground">
                      {capacity.growthProjections?.next90Days ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Projeção 90 dias</p>
                  </div>
                </div>

                {capacity.capacityByArea?.length > 0 && (
                  <div className="rounded-xl bg-card border border-border p-5">
                    <h2 className="text-lg font-bold text-foreground mb-4">
                      Capacidade por Área
                    </h2>
                    <ChartContainer
                      config={Object.fromEntries(
                        capacity.capacityByArea.map((a, i) => [
                          a.area,
                          { label: a.area, color: CHART_COLORS[i % CHART_COLORS.length] },
                        ])
                      )}
                      className="h-[280px]"
                    >
                      <BarChart
                        data={capacity.capacityByArea.map((a) => ({
                          area: a.area,
                          utilização: a.utilizationRate,
                          uso: a.currentUsage,
                          máximo: a.maxCapacity,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="area" tickLine={false} />
                        <YAxis tickLine={false} tickFormatter={(v) => v + "%"} />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(v, _name, _item) => {
                                const p = _item?.payload as Record<string, unknown>;
                                return p ? (
                                  <span>
                                    {String(p.uso)} / {String(p.máximo)} ({v}%)
                                  </span>
                                ) : (
                                  <span>{v}%</span>
                                );
                              }}
                            />
                          }
                        />
                        <Bar dataKey="utilização" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}

                {capacity.recommendations?.length > 0 && (
                  <div className="rounded-xl bg-card border border-border p-5">
                    <h2 className="text-lg font-bold text-foreground mb-4">
                      Recomendações
                    </h2>
                    <ul className="space-y-2">
                      {capacity.recommendations.map((r, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span
                            className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                              r.priority === "high" ? "bg-destructive" : "bg-amber-500"
                            }`}
                          />
                          {r.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground py-12 text-center">
                Nenhum dado disponível.
              </p>
            )}
          </TabsContent>
        </Tabs>

    </div>
  );
};

export default Financeiro;
