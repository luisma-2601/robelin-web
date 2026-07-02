"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, X, AlertCircle, CheckCircle, Download, Trash2 } from "lucide-react";
import { bulkUpdateProductsAction } from "@/app/actions/products";
import { Product } from "@/lib/types";

interface UpdateRow {
  id: string;
  name: string;
  price_usd?: number;
  stock?: number;
  error?: string;
}

function parseUpdateCSV(text: string, products: Product[]): UpdateRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const sep = header.includes("\t") ? "\t" : header.includes(";") ? ";" : ",";
  const cols = header.split(sep).map((c) => c.trim().replace(/^["']|["']$/g, ""));

  const idIdx    = cols.findIndex((c) => c === "id");
  const priceIdx = cols.findIndex((c) => ["precio", "price", "precio_usd", "price_usd"].includes(c));
  const stockIdx = cols.findIndex((c) => ["stock", "cantidad", "qty"].includes(c));

  if (idIdx === -1) {
    return [{ id: "", name: "", error: "El CSV debe tener una columna 'id'" }];
  }
  if (priceIdx === -1 && stockIdx === -1) {
    return [{ id: "", name: "", error: "El CSV debe tener al menos 'precio' o 'stock'" }];
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  return lines.slice(1).map((line) => {
    const values = line.split(sep).map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const id = values[idIdx] || "";

    const product = productMap.get(id);
    if (!id) return { id: "", name: "—", error: "ID vacío" };
    if (!product) return { id, name: id, error: "ID no encontrado en el inventario" };

    const price_usd = priceIdx !== -1 && values[priceIdx] !== ""
      ? parseFloat(values[priceIdx].replace(",", "."))
      : undefined;
    const stock = stockIdx !== -1 && values[stockIdx] !== ""
      ? parseInt(values[stockIdx], 10)
      : undefined;

    let error: string | undefined;
    if (price_usd !== undefined && (isNaN(price_usd) || price_usd < 0)) error = "Precio inválido";
    else if (stock !== undefined && (isNaN(stock) || stock < 0)) error = "Stock inválido";
    else if (price_usd === undefined && stock === undefined) error = "Sin valores para actualizar";

    return { id, name: product.name, price_usd, stock, error };
  });
}

export default function BulkUpdate({ products }: { products: Product[] }) {
  const [open, setOpen]       = useState(false);
  const [rows, setRows]       = useState<UpdateRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult]   = useState<{ updated: number; failed: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router  = useRouter();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => setRows(parseUpdateCSV(ev.target?.result as string, products));
    reader.readAsText(file);
  };

  const validRows  = rows.filter((r) => !r.error);
  const errorRows  = rows.filter((r) => r.error);

  const handleUpdate = async () => {
    if (validRows.length === 0) return;
    setIsLoading(true);
    try {
      const res = await bulkUpdateProductsAction(
        validRows.map(({ id, price_usd, stock }) => ({ id, price_usd, stock }))
      );
      setResult(res);
      setRows([]);
      setFileName("");
      router.refresh();
    } catch (e: unknown) {
      alert("Error: " + (e instanceof Error ? e.message : "desconocido"));
    }
    setIsLoading(false);
  };

  const downloadTemplate = () => {
    const today = new Date().toISOString().slice(0, 10);
    const sep = ";";
    const header = ["id", "nombre", "precio", "stock"].join(sep);
    const body = products
      .map((p) => [p.id, `"${p.name.replace(/"/g, '""')}"`, p.price_usd, p.stock].join(sep))
      .join("\n");
    const blob = new Blob(["﻿" + header + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `EstadoInventario_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeModal = () => { setOpen(false); setRows([]); setFileName(""); setResult(null); };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
      >
        <RefreshCw size={16} /> Actualizar CSV
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isLoading && closeModal()} />
      <div className="relative bg-[#111] border border-white/10 rounded-2xl p-5 md:p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <RefreshCw size={20} className="text-primary" /> Actualizar Precios y Stock por CSV
          </h3>
          <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 text-sm text-gray-400 space-y-2">
          <p className="font-medium text-white text-sm">Formato del archivo:</p>
          <p>Columnas requeridas + al menos una de las opcionales:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {[
              { col: "id", required: true },
              { col: "precio", required: false },
              { col: "stock", required: false },
            ].map(({ col, required }) => (
              <span key={col} className={`px-2 py-1 rounded text-xs font-mono border ${required ? "bg-primary/10 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-white"}`}>
                {col}{required ? " *" : ""}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            La columna <span className="text-white font-mono">nombre</span> es opcional pero útil como referencia visual — no se usa para la actualización.
          </p>
          <button onClick={downloadTemplate} className="mt-2 text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
            <Download size={14} /> Descargar plantilla con productos actuales
          </button>
        </div>

        {/* File drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-primary/30 rounded-xl p-8 text-center cursor-pointer transition-colors group"
        >
          <RefreshCw size={32} className="mx-auto text-gray-500 group-hover:text-primary transition-colors mb-3" />
          <p className="text-sm text-gray-400">
            {fileName
              ? <span className="text-white font-medium">{fileName}</span>
              : "Haz clic para seleccionar un archivo CSV"}
          </p>
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleFile} className="hidden" />
        </div>

        {/* Success */}
        {result && (
          <div className={`rounded-xl p-4 flex items-center gap-3 border ${result.failed === 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-yellow-500/10 border-yellow-500/20"}`}>
            <CheckCircle size={20} className={result.failed === 0 ? "text-emerald-400" : "text-yellow-400"} />
            <p className="text-sm font-medium">
              <span className={result.failed === 0 ? "text-emerald-400" : "text-yellow-400"}>
                {result.updated} producto{result.updated !== 1 ? "s" : ""} actualizados
                {result.failed > 0 && ` · ${result.failed} fallaron`}
              </span>
            </p>
          </div>
        )}

        {/* Preview */}
        {rows.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">{validRows.length}</span> válidos
              {errorRows.length > 0 && <span className="text-red-400 ml-2">· {errorRows.length} con errores</span>}
            </p>

            {/* Mobile */}
            <div className="space-y-2 md:hidden max-h-48 overflow-y-auto">
              {rows.map((row, i) => (
                <div key={i} className={`p-3 rounded-xl border text-sm ${row.error ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/5"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{row.name}</p>
                      <p className="text-gray-500 text-xs font-mono truncate">{row.id}</p>
                      {!row.error && (
                        <p className="text-gray-400 text-xs mt-0.5">
                          {row.price_usd !== undefined && `Precio: $${row.price_usd.toFixed(2)}`}
                          {row.price_usd !== undefined && row.stock !== undefined && " · "}
                          {row.stock !== undefined && `Stock: ${row.stock}`}
                        </p>
                      )}
                      {row.error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{row.error}</p>}
                    </div>
                    <button onClick={() => setRows(rows.filter((_, j) => j !== i))} className="p-1 text-gray-500 hover:text-red-400 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block max-h-56 overflow-y-auto rounded-xl border border-white/5">
              <table className="w-full text-sm">
                <thead className="bg-[#0a0a0a] text-gray-500 text-xs uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left">Producto</th>
                    <th className="px-4 py-3 text-right">Nuevo Precio</th>
                    <th className="px-4 py-3 text-right">Nuevo Stock</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((row, i) => (
                    <tr key={i} className={row.error ? "bg-red-500/5" : "hover:bg-white/5"}>
                      <td className="px-4 py-2.5">
                        <p className="text-white font-medium truncate max-w-[180px]">{row.name}</p>
                        <p className="text-gray-600 text-xs font-mono truncate max-w-[180px]">{row.id}</p>
                      </td>
                      <td className="px-4 py-2.5 text-right text-white">
                        {row.price_usd !== undefined ? `$${row.price_usd.toFixed(2)}` : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-300">
                        {row.stock !== undefined ? row.stock : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        {row.error
                          ? <span className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{row.error}</span>
                          : <span className="text-emerald-400 text-xs">✓ Válido</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => setRows(rows.filter((_, j) => j !== i))} className="p-1 text-gray-500 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => { setRows([]); setFileName(""); }}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 text-sm font-medium flex items-center justify-center gap-2"
              >
                <X size={16} /> Limpiar
              </button>
              <button
                onClick={handleUpdate}
                disabled={isLoading || validRows.length === 0}
                className="flex-1 py-2.5 bg-primary/10 border border-primary/30 hover:bg-primary/20 rounded-xl text-primary font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {isLoading
                  ? <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  : <><RefreshCw size={16} /> Actualizar {validRows.length} producto{validRows.length !== 1 ? "s" : ""}</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
