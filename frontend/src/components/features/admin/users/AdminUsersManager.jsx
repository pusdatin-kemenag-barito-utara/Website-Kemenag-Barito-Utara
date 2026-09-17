"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  UserPlus,
  ShieldCheck,
  UserCheck,
  Edit3,
  Trash2,
  Search,
  RefreshCw,
  Users,
  Shield,
  Check,
  X,
  Lock,
  Mail,
  User,
  FileText,
  Briefcase,
  Image as ImageIcon,
  FolderOpen,
  Sliders,
  Video,
  Settings,
  Bot,
  UserCog,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";
import { FloatingFeedback, DeleteConfirmModal } from "../slides/SlidesUI";
import { EyeIcon } from "../login/LoginUI";

export const MODULE_DEFINITIONS = [
  {
    id: "berita",
    label: "Berita & Artikel",
    description: "Kelola artikel, berita kegiatan, draf publikasi, dan kategori berita.",
    icon: FileText,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
    granular: ["berita:view", "berita:create", "berita:update", "berita:delete", "berita:publish"],
    defaultInAdmin: true,
    defaultInEditor: true,
  },
  {
    id: "seksi",
    label: "Kepegawaian & Seksi",
    description: "Kelola daftar seksi, unit kerja, pejabat struktural, dan data pegawai.",
    icon: Briefcase,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
    granular: ["seksi:manage"],
    defaultInAdmin: true,
    defaultInEditor: false,
  },
  {
    id: "galeri",
    label: "Galeri Visual",
    description: "Upload foto dokumentasi kegiatan, album kegiatan, dan media visual.",
    icon: ImageIcon,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
    granular: ["galeri:view", "galeri:manage"],
    defaultInAdmin: true,
    defaultInEditor: true,
  },
  {
    id: "laporan",
    label: "Dokumen Laporan",
    description: "Upload berkas PDF laporan resmi, dokumen publik, dan akuntabilitas.",
    icon: FolderOpen,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40",
    granular: ["laporan:view", "laporan:manage"],
    defaultInAdmin: true,
    defaultInEditor: false,
  },
  {
    id: "slides",
    label: "Infografis / Slider",
    description: "Manajemen slide banner beranda website dan infografis keagamaan.",
    icon: Sliders,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
    granular: ["homepage_slides:view", "homepage_slides:manage"],
    defaultInAdmin: true,
    defaultInEditor: false,
  },
  {
    id: "youtube",
    label: "Dokumentasi YouTube",
    description: "Kelola daftar feed video dan dokumentasi siaran YouTube resmi.",
    icon: Video,
    color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40",
    granular: ["youtube:manage", "homepage_slides:view"],
    defaultInAdmin: true,
    defaultInEditor: false,
  },
  {
    id: "pengaturan",
    label: "Pengaturan Identitas",
    description: "Konfigurasi nama kantor, profil instansi, kontak, dan tautan sosial media.",
    icon: Settings,
    color: "text-slate-500 bg-slate-100 dark:bg-slate-800",
    granular: ["settings:manage", "pengaturan:manage"],
    defaultInAdmin: false,
    defaultInEditor: false,
  },
  {
    id: "sync_ai",
    label: "Sinkronisasi AI Knowledge",
    description: "Sinkronkan basis pengetahuan berita dan dokumen ke asisten AI Kemenag.",
    icon: Bot,
    color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40",
    granular: ["ai:manage"],
    defaultInAdmin: false,
    defaultInEditor: false,
  },
  {
    id: "users",
    label: "Kelola Pengguna Admin",
    description: "Tambah, ubah peran, kelola hak akses modul, dan hapus akun admin.",
    icon: UserCog,
    color: "text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/40",
    granular: ["user:view", "user:invite", "user:update_role", "user:delete"],
    defaultInAdmin: false,
    defaultInEditor: false,
  },
];

const ALL_MODULE_IDS = MODULE_DEFINITIONS.map((m) => m.id);

function getRoleDefaults(role) {
  if (role === "super_admin") return ALL_MODULE_IDS;
  if (role === "admin") {
    return MODULE_DEFINITIONS.filter((m) => m.defaultInAdmin).map((m) => m.id);
  }
  if (role === "editor") {
    return MODULE_DEFINITIONS.filter((m) => m.defaultInEditor).map((m) => m.id);
  }
  return [];
}

function resolveUserModuleIds(user) {
  if (!user) return [];
  if (user.role === "super_admin") return ALL_MODULE_IDS;

  const rawPerms = Array.isArray(user.permissions) ? user.permissions : [];
  if (rawPerms.length > 0) {
    const result = new Set();
    rawPerms.forEach((p) => {
      const matchMod = MODULE_DEFINITIONS.find((m) => m.id === p);
      if (matchMod) {
        result.add(matchMod.id);
      } else {
        const prefix = p.split(":")[0];
        const matchPrefix = MODULE_DEFINITIONS.find(
          (m) => m.id === prefix || (m.granular && m.granular.includes(p))
        );
        if (matchPrefix) {
          result.add(matchPrefix.id);
        }
      }
    });
    return Array.from(result);
  }

  return getRoleDefaults(user.role);
}

function compileFullPermissions(selectedModuleIds) {
  const permsSet = new Set(selectedModuleIds);
  selectedModuleIds.forEach((modId) => {
    const mod = MODULE_DEFINITIONS.find((m) => m.id === modId);
    if (mod && mod.granular) {
      mod.granular.forEach((g) => permsSet.add(g));
    }
  });
  return Array.from(permsSet);
}

export default function AdminUsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Feedback notifications
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackErr, setFeedbackErr] = useState("");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "editor",
    selectedModules: getRoleDefaults("editor"),
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Edit Modal
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    role: "editor",
    status: "active",
    selectedModules: [],
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete Modal
  const [deletingUser, setDeletingUser] = useState(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setUsers(data.users || []);
      } else {
        setFeedbackErr(data.message || "Gagal memuat daftar pengguna admin.");
      }
    } catch (err) {
      setFeedbackErr("Koneksi gagal saat memuat daftar pengguna.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        (u.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === "all" || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, search, filterRole]);

  // Realtime Counts
  const counts = useMemo(() => {
    return {
      total: users.length,
      superAdmin: users.filter((u) => u.role === "super_admin").length,
      admin: users.filter((u) => u.role === "admin").length,
      editor: users.filter((u) => u.role === "editor").length,
    };
  }, [users]);

  // Create Handler
  async function handleCreateSubmit(e) {
    e.preventDefault();
    if (!createForm.email || !createForm.email.includes("@")) {
      setFeedbackErr("Format email tidak valid.");
      return;
    }
    if (!createForm.password || createForm.password.length < 8) {
      setFeedbackErr("Password wajib minimal 8 karakter.");
      return;
    }

    setSubmittingCreate(true);
    const finalPermissions =
      createForm.role === "super_admin"
        ? compileFullPermissions(ALL_MODULE_IDS)
        : compileFullPermissions(createForm.selectedModules);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createForm.email,
          fullName: createForm.fullName,
          password: createForm.password,
          role: createForm.role,
          permissions: finalPermissions,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setFeedbackMsg(data.message || "Pengguna admin baru berhasil ditambahkan!");
        setIsCreateOpen(false);
        setCreateForm({
          email: "",
          fullName: "",
          password: "",
          role: "editor",
          selectedModules: getRoleDefaults("editor"),
        });
        fetchUsers();
      } else {
        setFeedbackErr(data.message || "Gagal menambahkan pengguna admin.");
      }
    } catch (err) {
      setFeedbackErr("Terjadi kesalahan jaringan saat menyimpan data.");
    } finally {
      setSubmittingCreate(false);
    }
  }

  // Open Edit Modal
  function openEditModal(u) {
    setEditingUser(u);
    const initialModules = resolveUserModuleIds(u);
    setEditForm({
      fullName: u.fullName || "",
      role: u.role || "editor",
      status: u.status || (u.isActive ? "active" : "inactive"),
      selectedModules: initialModules,
    });
  }

  // Role Change in Create Modal
  function handleCreateRoleChange(newRole) {
    setCreateForm((prev) => ({
      ...prev,
      role: newRole,
      selectedModules: getRoleDefaults(newRole),
    }));
  }

  // Role Change in Edit Modal
  function handleEditRoleChange(newRole) {
    setEditForm((prev) => ({
      ...prev,
      role: newRole,
      selectedModules: getRoleDefaults(newRole),
    }));
  }

  // Edit Submit Handler
  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editingUser) return;

    setSubmittingEdit(true);
    const finalPermissions =
      editForm.role === "super_admin"
        ? compileFullPermissions(ALL_MODULE_IDS)
        : compileFullPermissions(editForm.selectedModules);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editForm.fullName,
          role: editForm.role,
          status: editForm.status,
          isActive: editForm.status === "active",
          permissions: finalPermissions,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setFeedbackMsg("Data dan hak akses pengguna admin berhasil diperbarui!");
        setEditingUser(null);
        fetchUsers();
      } else {
        setFeedbackErr(data.message || "Gagal memperbarui pengguna admin.");
      }
    } catch (err) {
      setFeedbackErr("Terjadi kesalahan jaringan saat memperbarui data.");
    } finally {
      setSubmittingEdit(false);
    }
  }

  // Delete Confirm Handler
  async function handleDeleteConfirm() {
    if (!deletingUser) return;

    setSubmittingDelete(true);
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setFeedbackMsg("Pengguna admin berhasil dihapus dari sistem!");
        setDeletingUser(null);
        fetchUsers();
      } else {
        setFeedbackErr(data.message || "Gagal menghapus pengguna.");
      }
    } catch (err) {
      setFeedbackErr("Terjadi kesalahan jaringan saat menghapus pengguna.");
    } finally {
      setSubmittingDelete(false);
    }
  }

  // Module toggle helper
  function toggleModule(formSetter, formState, moduleId) {
    const current = formState.selectedModules || [];
    if (current.includes(moduleId)) {
      formSetter({
        ...formState,
        selectedModules: current.filter((id) => id !== moduleId),
      });
    } else {
      formSetter({
        ...formState,
        selectedModules: [...current, moduleId],
      });
    }
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8 p-3 sm:p-6 lg:p-8">
      {/* Floating Notifications */}
      <FloatingFeedback
        message={feedbackMsg}
        error={feedbackErr}
        onClose={() => {
          setFeedbackMsg("");
          setFeedbackErr("");
        }}
      />

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sistem RBAC Mandiri Terintegrasi
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              kemenag_website.admin_users
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Kelola Pengguna & Hak Akses
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Manajemen akun administrator, peran sistem, dan hak akses modul internal Kemenag Barito Utara.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreatePassword(false);
            setCreateForm({
              email: "",
              fullName: "",
              password: "",
              role: "editor",
              selectedModules: getRoleDefaults("editor"),
            });
            setIsCreateOpen(true);
          }}
          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30 active:scale-95 shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pengguna</p>
            <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{counts.total}</p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">Terdaftar di database mandiri</p>
        </div>

        <div className="rounded-3xl border border-purple-200/80 bg-purple-50/30 p-5 sm:p-6 shadow-sm dark:border-purple-900/40 dark:bg-purple-950/20">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-700 dark:text-purple-400">Super Admin</p>
            <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-purple-950 dark:text-purple-100">{counts.superAdmin}</p>
          <p className="mt-1 text-[11px] font-medium text-purple-600/80 dark:text-purple-400">Otoritas Penuh Semua Modul</p>
        </div>

        <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/30 p-5 sm:p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Admin</p>
            <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-950 dark:text-emerald-100">{counts.admin}</p>
          <p className="mt-1 text-[11px] font-medium text-emerald-600/80 dark:text-emerald-400">Kelola Konten & Seksi</p>
        </div>

        <div className="rounded-3xl border border-sky-200/80 bg-sky-50/30 p-5 sm:p-6 shadow-sm dark:border-sky-900/40 dark:bg-sky-950/20">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-sky-700 dark:text-sky-400">Editor</p>
            <div className="h-9 w-9 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-sky-600 dark:text-sky-300">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-sky-950 dark:text-sky-100">{counts.editor}</p>
          <p className="mt-1 text-[11px] font-medium text-sky-600/80 dark:text-sky-400">Penulis Berita & Galeri</p>
        </div>
      </div>

      {/* Filter and Search Container */}
      <div className="w-full rounded-3xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value="all">Semua Peran (Role)</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center justify-center p-2.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
              title="Muat Ulang Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Peran (Role)</th>
                <th className="px-6 py-4">Status Akun</th>
                <th className="px-6 py-4">Hak Akses Modul Aktif</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                      <span className="text-xs font-semibold">Memuat data pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada data pengguna yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuper = u.role === "super_admin";
                  const isAdmin = u.role === "admin";
                  const isActive = u.status === "active" && u.isActive !== false;
                  const userModules = resolveUserModuleIds(u);

                  return (
                    <tr
                      key={u.id}
                      className="group transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden font-black text-slate-600 dark:text-slate-300">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.fullName || u.email}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              (u.fullName || u.email || "U").slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {u.fullName || "Tanpa Nama"}
                            </div>
                            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                              <Mail className="h-3 w-3 inline" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                            <ShieldCheck className="h-3 w-3 text-purple-500" />
                            Super Admin
                          </span>
                        ) : isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                            <Shield className="h-3 w-3 text-emerald-500" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50">
                            <UserCheck className="h-3 w-3 text-sky-500" />
                            Editor
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/40"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                            }`}
                          />
                          {isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      {/* Module Permissions */}
                      <td className="px-6 py-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
                            <Sparkles className="h-3 w-3" />
                            Akses Penuh Semua Modul
                          </span>
                        ) : userModules.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {userModules.map((modId) => {
                              const mod = MODULE_DEFINITIONS.find((m) => m.id === modId);
                              if (!mod) return null;
                              return (
                                <span
                                  key={mod.id}
                                  className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                >
                                  {mod.label.split("&")[0].trim()}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Tidak ada modul aktif</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-white dark:hover:text-white transition shadow-sm"
                            title="Ubah Pengguna & Hak Akses"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white transition shadow-sm"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH PENGGUNA BARU */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => !submittingCreate && setIsCreateOpen(false)}
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Tambah Pengguna Admin Baru
                  </h3>
                  <p className="text-xs text-slate-400">Buat kredensial login & pilih hak akses modul</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-6 space-y-5" autoComplete="off">
              {/* Fake hidden inputs to stop browser password managers from auto-filling */}
              <input type="text" name="fake_username_autofill" style={{ display: "none" }} tabIndex="-1" aria-hidden="true" autoComplete="off" />
              <input type="password" name="fake_password_autofill" style={{ display: "none" }} tabIndex="-1" aria-hidden="true" autoComplete="new-password" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Email Pengguna *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      name="admin_user_new_email"
                      id="admin_user_new_email"
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      required
                      placeholder="nama@kemenag.go.id"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Nama Lengkap *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="admin_user_new_fullname"
                      id="admin_user_new_fullname"
                      autoComplete="off"
                      required
                      placeholder="Nama dan gelar..."
                      value={createForm.fullName}
                      onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Password (Min. 8 Karakter) *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showCreatePassword ? "text" : "password"}
                      name="admin_user_new_password"
                      id="admin_user_new_password"
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      required
                      minLength={8}
                      placeholder="Minimal 8 karakter"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition rounded-xl"
                      title={showCreatePassword ? "Sembunyikan password" : "Lihat password"}
                      tabIndex="-1"
                    >
                      <EyeIcon isOpen={showCreatePassword} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Peran (Role)
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => handleCreateRoleChange(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="editor">Editor (Penulis Berita & Galeri)</option>
                    <option value="admin">Admin (Kelola Konten, Seksi & Laporan)</option>
                    <option value="super_admin">Super Admin (Akses Penuh Semua Modul)</option>
                  </select>
                </div>
              </div>

              {/* Module selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Hak Akses Modul Sistem
                  </label>
                  {createForm.role !== "super_admin" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCreateForm({
                            ...createForm,
                            selectedModules: getRoleDefaults(createForm.role),
                          })
                        }
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        Reset Standar Role
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCreateForm({ ...createForm, selectedModules: ALL_MODULE_IDS })
                        }
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      >
                        Pilih Semua
                      </button>
                    </div>
                  )}
                </div>

                {createForm.role === "super_admin" ? (
                  <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/50 dark:bg-purple-950/20 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-purple-600 shrink-0" />
                    <p className="text-xs font-semibold text-purple-800 dark:text-purple-300">
                      Super Admin memiliki otoritas penuh ke seluruh modul sistem secara otomatis.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {MODULE_DEFINITIONS.map((mod) => {
                      const Icon = mod.icon;
                      const isChecked = createForm.selectedModules.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          onClick={() => toggleModule(setCreateForm, createForm, mod.id)}
                          className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                            isChecked
                              ? "border-emerald-500 bg-emerald-50/40 dark:border-emerald-600 dark:bg-emerald-950/20 shadow-sm"
                              : "border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40"
                          }`}
                        >
                          <div
                            className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${mod.color}`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {mod.label}
                              </span>
                              <div
                                className={`h-4 w-4 rounded flex items-center justify-center ${
                                  isChecked
                                    ? "bg-emerald-600 text-white"
                                    : "border border-slate-300 dark:border-slate-600"
                                }`}
                              >
                                {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {mod.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={submittingCreate}
                  className="flex-1 py-3.5 rounded-2xl border-2 border-slate-100 bg-white text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submittingCreate ? "Menyimpan..." : "Simpan Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PENGGUNA */}
      {editingUser && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => !submittingEdit && setEditingUser(null)}
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 flex items-center justify-center shadow-sm">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Ubah Pengguna & Hak Akses
                  </h3>
                  <p className="text-xs text-slate-400">{editingUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-xl p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-6 space-y-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Peran Sistem (Role)
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => handleEditRoleChange(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Status Akun Login
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="active">Aktif (Dapat Mengakses Panel)</option>
                    <option value="inactive">Nonaktif (Akses Diblokir)</option>
                  </select>
                </div>
              </div>

              {/* Module selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Hak Akses Modul Sistem
                  </label>
                  {editForm.role !== "super_admin" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            selectedModules: getRoleDefaults(editForm.role),
                          })
                        }
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        Reset Standar Role
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm({ ...editForm, selectedModules: ALL_MODULE_IDS })
                        }
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      >
                        Pilih Semua
                      </button>
                    </div>
                  )}
                </div>

                {editForm.role === "super_admin" ? (
                  <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/50 dark:bg-purple-950/20 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-purple-600 shrink-0" />
                    <p className="text-xs font-semibold text-purple-800 dark:text-purple-300">
                      Super Admin memiliki otoritas penuh ke seluruh modul sistem secara otomatis.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {MODULE_DEFINITIONS.map((mod) => {
                      const Icon = mod.icon;
                      const isChecked = editForm.selectedModules.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          onClick={() => toggleModule(setEditForm, editForm, mod.id)}
                          className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                            isChecked
                              ? "border-emerald-500 bg-emerald-50/40 dark:border-emerald-600 dark:bg-emerald-950/20 shadow-sm"
                              : "border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40"
                          }`}
                        >
                          <div
                            className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${mod.color}`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {mod.label}
                              </span>
                              <div
                                className={`h-4 w-4 rounded flex items-center justify-center ${
                                  isChecked
                                    ? "bg-emerald-600 text-white"
                                    : "border border-slate-300 dark:border-slate-600"
                                }`}
                              >
                                {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {mod.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  disabled={submittingEdit}
                  className="flex-1 py-3.5 rounded-2xl border-2 border-slate-100 bg-white text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submittingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HAPUS PENGGUNA */}
      <DeleteConfirmModal
        open={Boolean(deletingUser)}
        onCancel={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
        loading={submittingDelete}
        title="Hapus Pengguna Admin?"
        description={`Apakah Anda yakin ingin menghapus akun ${deletingUser?.fullName || deletingUser?.email}? Akun ini tidak akan lagi dapat mengakses panel kontrol admin.`}
      />
    </div>
  );
}
