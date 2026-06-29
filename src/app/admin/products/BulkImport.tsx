"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle, Download, Trash2 } from "lucide-react";
import { bulkCreateProductsAction } from "@/app/actions/products";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface ParsedRow {
  name: string;
  description: string;
  category: string;
  price_usd: number;
  stock: number;
  error?: string;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const sep = header.includes("\t") ? "\t" : header.includes(";") ? ";" : ",";

  const cols = header.split(sep).map((c) => c.trim().replace(/^["']|["']$/g, ""));
  const nameIdx = cols.findIndex((c) => ["nombre", "name", "producto"].includes(c));
  const descIdx = cols.findIndex((c) => ["descripcion", "descripción", "description", "desc"].includes(c));
  const catIdx = cols.findIndex((c) => ["categoria", "categoría", "category", "cat"].includes(c));
  const priceIdx = cols.findIndex((c) => ["precio", "price", "precio_usd", "price_usd", "precio usd"].includes(c));
  const stockIdx = cols.findIndex((c) => ["stock", "cantidad", "qty", "inventario"].includes(c));

  if (nameIdx === -1 || priceIdx === -1) {
    return [{ name: "", description: "", category: "", price_usd: 0, stock: 0, error: "CSV debe tener al menos columnas: nombre, precio" }];
  }

  const categories = PRODUCT_CATEGORIES.map((c) => c.toLowerCase());

  return lines.slice(1).map((line) => {
    const values = line.split(sep).map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const name = values[nameIdx] || "";
    const description = descIdx !== -1 ? values[descIdx] || "" : "";
    const rawCategory = catIdx !== -1 ? values[catIdx] || "" : "";
    const priceStr = values[priceIdx] || "0";
    const stockStr = stockIdx !== -1 ? values[stockIdx] || "0" : "0";

    const price_usd = parseFloat(priceStr.replace(",", "."));
    const stock = parseInt(stockStr, 10);

    const matchedCat = PRODUCT_CATEGORIES.find((c) => c.toLowerCase() === rawCategory.toLowerCase()) || rawCategory;

    let error: string | undefined;
    if (!name) error = "Nombre vacío";
    else if (isNaN(price_usd) || price_usd < 0) error = "Precio inválido";
    else if (isNaN(stock) || stock < 0) error = "Stock inválido";
    else if (rawCategory && !categories.includes(rawCategory.toLowerCase())) error = `Categoría "${rawCategory}" no válida`;

    return { name, description, category: matchedCat, price_usd: isNaN(price_usd) ? 0 : price_usd, stock: isNaN(stock) ? 0 : stock, error };
  });
}

export default function BulkImport() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRows(parseCSV(text));
    };
    reader.readAsText(file);
  };

  const validRows = rows.filter((r) => !r.error);
  const errorRows = rows.filter((r) => r.error);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setIsLoading(true);
    try {
      const count = await bulkCreateProductsAction(
        validRows.map(({ name, description, category, price_usd, stock }) => ({
          name, description, category, price_usd, stock,
        }))
      );
      setResult({ success: true, count });
      setRows([]);
      setFileName("");
      router.refresh();
    } catch (e: unknown) {
      alert("Error: " + (e instanceof Error ? e.message : "desconocido"));
    }
    setIsLoading(false);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const downloadTemplate = () => {
    const header = "nombre,descripcion,categoria,precio,stock";
    const example = `Shampoo Profesional,Shampoo para cabello seco,Cuidado Capilar,12.50,20
Tijera de Corte,Tijera profesional acero inoxidable,Barbería,25.00,10
Esmalte Rojo,Esmalte de uñas color rojo,Manicura,5.00,50`;
    const blob = new Blob([header + "\n" + example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_productos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
      >
        <FileSpreadsheet size={18} /> Importar CSV
      </button>
    );
  }

  const closeModal = () => { setOpen(false); setRows([]); setFileName(""); setResult(null); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isLoading && closeModal()} />
      <div className="relative bg-[#111] border border-white/10 rounded-2xl p-5 md:p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-primary" /> Importar Productos desde CSV
          </h3>
          <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 text-sm text-gray-400 space-y-2">
          <p className="font-medium text-white text-sm">Formato del archivo:</p>
          <p>El CSV debe tener estas columnas (la primera fila es el encabezado):</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {["nombre", "descripcion", "categoria", "precio", "stock"].map((col) => (
              <span key={col} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-white">{col}</span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Categorías válidas: {PRODUCT_CATEGORIES.join(", ")}. Separador: coma, punto y coma, o tabulación.
          </p>
          <button onClick={downloadTemplate} className="mt-2 text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
            <Download size={14} /> Descargar plantilla de ejemplo
          </button>
        </div>

        {/* File input */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-primary/30 rounded-xl p-8 text-center cursor-pointer transition-colors group"
        >
          <Upload size={32} className="mx-auto text-gray-500 group-hover:text-primary transition-colors mb-3" />
          <p className="text-sm text-gray-400">
            {fileName ? (
              <span className="text-white font-medium">{fileName}</span>
            ) : (
              "Haz clic para seleccionar un archivo CSV"
            )}
          </p>
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleFile} className="hidden" />
        </div>

        {/* Success result */}
        {result?.success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-400 font-medium">
              ¡{result.count} productos importados exitosamente!
            </p>
          </div>
        )}

        {/* Preview table */}
        {rows.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                <span className="text-white font-semibold">{validRows.length}</span> productos válidos
                {errorRows.length > 0 && (
                  <span className="text-red-400 ml-2">• {errorRows.length} con errores</span>
                )}
              </p>
            </div>

            {/* Mobile cards */}
            <div className="space-y-2 md:hidden max-h-48 overflow-y-auto">
              {rows.map((row, i) => (
                <div key={i} className={`p-3 rounded-xl border text-sm ${row.error ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/5"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{row.name || "—"}</p>
                      <p className="text-gray-500 text-xs">{row.category} • ${row.price_usd.toFixed(2)} • Stock: {row.stock}</p>
                      {row.error && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {row.error}
                        </p>
                      )}
                    </div>
                    <button onClick={() => removeRow(i)} className="p-1 text-gray-500 hover:text-red-400 shrink-0">
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
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">Categoría</th>
                    <th className="px-4 py-3 text-right">Precio</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((row, i) => (
                    <tr key={i} className={row.error ? "bg-red-500/5" : "hover:bg-white/5"}>
                      <td className="px-4 py-2.5 text-white font-medium max-w-[200px] truncate">{row.name || "—"}</td>
                      <td className="px-4 py-2.5 text-gray-400">{row.category || "—"}</td>
                      <td className="px-4 py-2.5 text-right text-white">${row.price_usd.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right text-gray-400">{row.stock}</td>
                      <td className="px-4 py-2.5">
                        {row.error ? (
                          <span className="text-red-400 text-xs flex items-center gap-1">
                            <AlertCircle size={12} /> {row.error}
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-xs">✓ Válido</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => removeRow(i)} className="p-1 text-gray-500 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Import button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => { setRows([]); setFileName(""); }}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 text-sm font-medium flex items-center justify-center gap-2"
              >
                <X size={16} /> Limpiar
              </button>
              <button
                onClick={handleImport}
                disabled={isLoading || validRows.length === 0}
                className="flex-1 py-2.5 bg-primary/10 border border-primary/30 hover:bg-primary/20 rounded-xl text-primary font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload size={16} /> Importar {validRows.length} producto{validRows.length !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
