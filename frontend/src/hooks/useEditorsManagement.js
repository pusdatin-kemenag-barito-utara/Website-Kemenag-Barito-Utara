import { useState, useEffect, useMemo } from "react";
import {
  deriveEditorPermissionGroups,
  expandEditorPermissionGroups,
} from "@/lib/permissions";
import { getPocketBase } from "@/lib/pocketbase/client";

export function useEditorsManagement(initialEditors = []) {
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [editors, setEditors] = useState(initialEditors);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [activeEditor, setActiveEditor] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyEditor, setVerifyEditor] = useState(null);
  const [verifyDecision, setVerifyDecision] = useState("approve");

  const [toggleActiveModalOpen, setToggleActiveModalOpen] = useState(false);
  const [toggleActiveEditor, setToggleActiveEditor] = useState(null);
  const [toggleActiveDecision, setToggleActiveDecision] = useState("activate");

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleEditor, setRoleEditor] = useState(null);
  const [roleDraft, setRoleDraft] = useState("editor");
  const [savingRole, setSavingRole] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creatingEditor, setCreatingEditor] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    fullName: "",
    email: "",
    unitName: "",
    password: "",
  });

  const [toast, setToast] = useState(null);

  async function loadEditors() {
    setLoading(true);
    setError("");

    try {
      const pb = getPocketBase();
      const records = await pb.collection("users").getFullList({
        sort: "-created",
      });

      const mapped = records.map((u) => ({
        user_id: u.id,
        id: u.id,
        full_name: u.name || u.email,
        name: u.name || "",
        email: u.email,
        unit_name: u.unit_name || "-",
        role: u.role || "editor",
        status: u.status || (u.is_active !== false ? "active" : "inactive"),
        is_active: u.is_active !== false,
        permissions: Array.isArray(u.permissions) ? u.permissions : [],
        last_sign_in_at: u.last_sign_in_at || u.updated,
        created_at: u.created,
      }));

      setEditors(mapped);
    } catch (err) {
      if (err.name === "AbortError" || err.isAbort) return;
      setError(err?.message || "Terjadi kesalahan saat memuat editor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialEditors?.length) {
      loadEditors();
    }
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timeout);
  }, [toast]);

  function pushToast(type, text) {
    setToast({ type, text });
  }

  function openPermissions(editor) {
    setActiveEditor(editor);
    const editorPermissions = Array.isArray(editor.permissions)
      ? editor.permissions
      : [];
    setSelectedPermissions(deriveEditorPermissionGroups(editorPermissions));
    setModalOpen(true);
  }

  function closePermissions() {
    setModalOpen(false);
    setActiveEditor(null);
    setSelectedPermissions([]);
  }

  function togglePermission(permission) {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((item) => item !== permission)
        : [...prev, permission],
    );
  }

  function openConfirmDialog({
    title,
    description,
    confirmLabel = "Lanjutkan",
    confirmTone = "emerald",
    onConfirm,
  }) {
    setConfirmDialog({
      title,
      description,
      confirmLabel,
      confirmTone,
      onConfirm,
    });
  }

  function closeConfirmDialog() {
    setConfirmDialog(null);
  }

  async function updateEditor(userId, payload, actionKey, successText) {
    setBusyAction(`${actionKey}:${userId}`);
    setMessage("");
    setError("");

    try {
      const pb = getPocketBase();
      if (payload.action === "delete") {
        await pb.collection("users").delete(userId);
        setEditors((prev) => prev.filter((ed) => ed.user_id !== userId));
      } else if (payload.action === "approve") {
        await pb.collection("users").update(userId, { status: "active", is_active: true });
      } else if (payload.action === "reject") {
        await pb.collection("users").update(userId, { status: "rejected", is_active: false });
      } else if (payload.action === "activate") {
        await pb.collection("users").update(userId, { status: "active", is_active: true });
      } else if (payload.action === "deactivate") {
        await pb.collection("users").update(userId, { status: "inactive", is_active: false });
      } else if (payload.action === "unlock") {
        await pb.collection("users").update(userId, { status: "active", is_active: true });
      } else if (payload.action === "set_role") {
        await pb.collection("users").update(userId, { role: payload.role });
      }

      const successMessage = successText || "Aksi berhasil diproses.";
      setMessage(successMessage);
      pushToast("success", successMessage);

      await loadEditors();
    } catch (err) {
      const errorMessage =
        err?.message || "Terjadi kesalahan saat memproses aksi.";
      setError(errorMessage);
      pushToast("error", errorMessage);
    } finally {
      setBusyAction("");
    }
  }

  async function savePermissions() {
    if (!activeEditor) return;

    setSavingPermissions(true);
    setMessage("");
    setError("");

    try {
      const pb = getPocketBase();
      const perms = expandEditorPermissionGroups(selectedPermissions);
      await pb.collection("users").update(activeEditor.user_id, {
        permissions: perms,
      });

      setMessage("Permission editor berhasil disimpan.");
      pushToast("success", "Permission editor berhasil disimpan.");
      closePermissions();
      await loadEditors();
    } catch (err) {
      const errorMessage =
        err?.message || "Terjadi kesalahan saat menyimpan permission.";
      setError(errorMessage);
      pushToast("error", errorMessage);
    } finally {
      setSavingPermissions(false);
    }
  }

  function openVerifyModal(editor) {
    setVerifyEditor(editor);
    setVerifyDecision(editor?.status === "rejected" ? "reject" : "approve");
    setVerifyModalOpen(true);
  }

  function closeVerifyModal() {
    setVerifyModalOpen(false);
    setVerifyEditor(null);
    setVerifyDecision("approve");
  }

  async function saveVerifyDecision() {
    if (!verifyEditor) return;

    await updateEditor(
      verifyEditor.user_id,
      { action: verifyDecision },
      verifyDecision,
      verifyDecision === "approve"
        ? "Akun editor berhasil diapprove."
        : "Akun editor berhasil direject.",
    );

    closeVerifyModal();
  }

  function openToggleActiveModal(editor) {
    setToggleActiveEditor(editor);
    setToggleActiveDecision(editor?.is_active ? "deactivate" : "activate");
    setToggleActiveModalOpen(true);
  }

  function closeToggleActiveModal() {
    setToggleActiveModalOpen(false);
    setToggleActiveEditor(null);
    setToggleActiveDecision("activate");
  }

  async function saveToggleActiveDecision() {
    if (!toggleActiveEditor) return;

    await updateEditor(
      toggleActiveEditor.user_id,
      { action: toggleActiveDecision },
      "toggle",
      toggleActiveDecision === "activate"
        ? "Akun berhasil diaktifkan."
        : "Akun berhasil dinonaktifkan.",
    );

    closeToggleActiveModal();
  }

  function openRoleModal(editor) {
    setRoleEditor(editor);
    setRoleDraft(editor?.role === "admin" ? "admin" : "editor");
    setRoleModalOpen(true);
  }

  function closeRoleModal() {
    setRoleModalOpen(false);
    setRoleEditor(null);
    setRoleDraft("editor");
  }

  async function saveRole() {
    if (!roleEditor) return;

    setSavingRole(true);
    setMessage("");
    setError("");

    try {
      const pb = getPocketBase();
      await pb.collection("users").update(roleEditor.user_id, {
        role: roleDraft,
      });

      const successMessage = "Role akun berhasil diperbarui.";
      setMessage(successMessage);
      pushToast("success", successMessage);
      closeRoleModal();
      await loadEditors();
    } catch (err) {
      const errorMessage =
        err?.message || "Terjadi kesalahan saat mengubah role.";
      setError(errorMessage);
      pushToast("error", errorMessage);
    } finally {
      setSavingRole(false);
    }
  }

  function handleDelete(editor) {
    openConfirmDialog({
      title: "Hapus Akun Editor",
      description: `Hapus akun ${editor.full_name}? Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: "Hapus Akun",
      confirmTone: "rose",
      onConfirm: () =>
        updateEditor(
          editor.user_id,
          { action: "delete" },
          "delete",
          "Akun berhasil dihapus.",
        ),
    });
  }

  function handleUnlock(editor) {
    openConfirmDialog({
      title: "Buka Kunci Akun",
      description: `Buka kunci akun ${editor.full_name}? Ini akan me-reset jumlah percobaan login yang gagal.`,
      confirmLabel: "Buka Kunci",
      confirmTone: "emerald",
      onConfirm: () =>
        updateEditor(
          editor.user_id,
          { action: "unlock" },
          "unlock",
          "Kunci akun berhasil dibuka.",
        ),
    });
  }

  function openCreateModal() {
    setCreateFormData({
      fullName: "",
      email: "",
      unitName: "",
      password: "",
    });
    setCreateModalOpen(true);
  }

  function closeCreateModal() {
    setCreateModalOpen(false);
  }

  function handleCreateFormDataChange(key, value) {
    setCreateFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function saveCreateEditor() {
    setCreatingEditor(true);
    setMessage("");
    setError("");

    try {
      const pb = getPocketBase();
      await pb.collection("users").create({
        name: createFormData.fullName.trim(),
        email: createFormData.email.trim(),
        unit_name: createFormData.unitName.trim(),
        password: createFormData.password,
        passwordConfirm: createFormData.password,
        role: "editor",
        status: "active",
        is_active: true,
      });

      pushToast("success", "Akun editor baru berhasil dibuat dan langsung aktif.");
      closeCreateModal();
      await loadEditors();
    } catch (err) {
      const errorMessage = err?.message || "Terjadi kesalahan saat membuat akun.";
      setError(errorMessage);
      pushToast("error", errorMessage);
    } finally {
      setCreatingEditor(false);
    }
  }

  const pendingCount = useMemo(
    () => editors.filter((item) => item.status === "pending").length,
    [editors],
  );

  const filteredEditors = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return editors.filter((item) => {
      const role = String(item.role || "editor").toLowerCase();
      const matchesRole = filterRole === "all" ? true : role === filterRole;

      if (!matchesRole) return false;
      if (!keyword) return true;

      const haystack = [
        item.full_name,
        item.email,
        item.unit_name,
        item.status,
        role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [editors, search, filterRole]);

  function getPermissionCount(editor) {
    const editorPermissions = Array.isArray(editor?.permissions)
      ? editor.permissions
      : [];
    const selectedGroups = deriveEditorPermissionGroups(editorPermissions);
    return selectedGroups.length;
  }

  return {
    busyAction,
    message,
    error,
    confirmDialog,
    editors,
    loading,
    search,
    setSearch,
    filterRole,
    setFilterRole,
    modalOpen,
    activeEditor,
    selectedPermissions,
    savingPermissions,
    verifyModalOpen,
    verifyEditor,
    verifyDecision,
    setVerifyDecision,
    toggleActiveModalOpen,
    toggleActiveEditor,
    toggleActiveDecision,
    setToggleActiveDecision,
    roleModalOpen,
    roleEditor,
    roleDraft,
    setRoleDraft,
    savingRole,
    toast,
    loadEditors,
    openPermissions,
    closePermissions,
    togglePermission,
    closeConfirmDialog,
    savePermissions,
    openVerifyModal,
    closeVerifyModal,
    saveVerifyDecision,
    openToggleActiveModal,
    closeToggleActiveModal,
    saveToggleActiveDecision,
    openRoleModal,
    closeRoleModal,
    saveRole,
    handleDelete,
    handleUnlock,
    pendingCount,
    filteredEditors,
    getPermissionCount,
    createModalOpen,
    creatingEditor,
    createFormData,
    openCreateModal,
    closeCreateModal,
    handleCreateFormDataChange,
    saveCreateEditor,
  };
}
