import React, { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Card, CardContent } from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";

function toDateKey(value = "") {
  const match = String(value).match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return "";
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function unique(items, field) {
  return Array.from(new Set(items.map((item) => item?.[field]).filter(Boolean))).sort();
}

function exportTxt(logs) {
  const header = "Data\tAção\tMenu\tUsuário\tDetalhe";
  const rows = logs.map((log) => [log.date, log.action, log.menu, log.user, log.detail]
    .map((item) => String(item || "").replace(/\t/g, " "))
    .join("\t"));
  const content = [header, ...rows].join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "logs-filtrados.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function LogsView({ logs = [] }) {
  const [menuFilter, setMenuFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const menus = useMemo(() => unique(logs, "menu"), [logs]);
  const users = useMemo(() => unique(logs, "user"), [logs]);

  const filteredLogs = logs.filter((log) => {
    const menuOk = menuFilter === "all" || log.menu === menuFilter;
    const userOk = userFilter === "all" || log.user === userFilter;
    const logDate = toDateKey(log.date);
    const fromOk = !dateFrom || logDate >= dateFrom;
    const toOk = !dateTo || logDate <= dateTo;
    return menuOk && userOk && fromOk && toOk;
  });

  return (
    <section className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
        <Button onClick={() => exportTxt(filteredLogs)} variant="outline" className="rounded-2xl border-stone-200 bg-white">
          <Download className="mr-2 h-4 w-4" /> Exportar TXT
        </Button>
      </div>

      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select value={menuFilter} onChange={(e) => setMenuFilter(e.target.value)} className="h-11 rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none">
              <option value="all">Todos os menus</option>
              {menus.map((menu) => <option key={menu}>{menu}</option>)}
            </select>
            <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="h-11 rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none">
              <option value="all">Todos os usuários</option>
              {users.map((user) => <option key={user}>{user}</option>)}
            </select>
            <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 text-sm text-stone-500">
              <span>De</span>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex-1 bg-transparent outline-none" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 text-sm text-stone-500">
              <span>Até</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex-1 bg-transparent outline-none" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-3 pr-4 font-medium">Data</th>
                  <th className="py-3 pr-4 font-medium">Ação</th>
                  <th className="py-3 pr-4 font-medium">Menu</th>
                  <th className="py-3 pr-4 font-medium">Usuário</th>
                  <th className="py-3 pr-4 font-medium">Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-stone-100">
                      <td className="whitespace-nowrap py-3 pr-4 text-stone-600">{log.date}</td>
                      <td className="py-3 pr-4 font-medium text-stone-900">{log.action}</td>
                      <td className="py-3 pr-4 text-stone-600">{log.menu}</td>
                      <td className="py-3 pr-4 text-stone-600">{log.user}</td>
                      <td className="py-3 pr-4 text-stone-600">{log.detail}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="py-6 text-stone-500" colSpan={5}>Nenhum log encontrado com os filtros atuais.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
