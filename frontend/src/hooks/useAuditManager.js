import { useState, useEffect, useCallback, useMemo } from "react";
import { getPocketBase } from "@/lib/pocketbase/client";

export function useAuditManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [deletingId, setDeletingId] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [bulkAction, setBulkAction] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const pb = getPocketBase();
      const records = await pb.collection("audit_logs").getList(1, 200, {
        sort: "-created",
      });

      setItems(Array.isArray(records?.items) ? records.items : []);
      setCurrentPage(1);
    } catch (err) {
      if (err.name === "AbortError" || err.isAbort) return;
      setError(err?.message || "Gagal memuat riwayat aktivitas.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!message && !error) return undefined;
    const timeout = window.setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);
    return () => window.clearTimeout(timeout);
  }, [message, error]);

  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const requestDelete = useCallback((id) => {
    setIdToDelete(id);
    setBulkAction(false);
    setShowDeleteModal(true);
  }, []);

  const requestClearAll = useCallback(() => {
    setBulkAction(true);
    setShowDeleteModal(true);
  }, []);

  const cancelDelete = useCallback(() => {
    setIdToDelete(null);
    setBulkAction(false);
    setShowDeleteModal(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      if (bulkAction) {
        setClearingAll(true);
      } else {
        setDeletingId(idToDelete);
      }

      setError("");
      setMessage("");

      const pb = getPocketBase();
      if (bulkAction) {
        for (const it of items) {
          try {
            await pb.collection("audit_logs").delete(it.id);
          } catch {
            // ignore
          }
        }
        setMessage("Berhasil mengosongkan seluruh riwayat log.");
      } else if (idToDelete) {
        await pb.collection("audit_logs").delete(idToDelete);
        setMessage("Berhasil menghapus log.");
      }

      setShowDeleteModal(false);
      setIdToDelete(null);
      setBulkAction(false);
      await loadItems();
    } catch (err) {
      setError(err?.message || "Gagal menghapus log.");
    } finally {
      setDeletingId(null);
      setClearingAll(false);
    }
  }, [idToDelete, bulkAction, items, loadItems]);

  return {
    items,
    paginatedItems,
    loading,
    message,
    setMessage,
    error,
    setError,
    currentPage,
    totalPages,
    handlePageChange,
    requestDelete,
    requestClearAll,
    cancelDelete,
    confirmDelete,
    showDeleteModal,
    idToDelete,
    bulkAction,
    deletingId,
    clearingAll,
  };
}
