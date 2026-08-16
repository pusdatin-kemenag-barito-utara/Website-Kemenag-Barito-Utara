import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminLaporanCategoryManager from "../src/components/features/admin/AdminLaporanCategoryManager";
import { fetchCategoryDocuments } from "../src/lib/laporan-api";

vi.mock("../src/lib/laporan-api", () => ({
    fetchCategoryDocuments: vi.fn(),
    uploadLaporanDocument: vi.fn(),
    updateLaporanDocument: vi.fn(),
    deleteLaporanDocument: vi.fn(),
}));

describe("AdminLaporanCategoryManager", () => {
    const categories = [
        {
            id: "1",
            slug: "sop",
            title: "SOP dan Standar Pelayanan",
            description: "Kumpulan SOP dan standar pelayanan",
        },
        {
            id: "2",
            slug: "laporan-kinerja",
            title: "Laporan Kinerja",
            description: "Dokumen laporan kinerja",
        },
    ];

    const category = {
        id: "1",
        slug: "sop",
        title: "SOP dan Standar Pelayanan",
        description: "Kumpulan SOP dan standar pelayanan",
        documents: [
            {
                id: 101,
                title: "Laporan 2025",
                description: "Deskripsi laporan 2025",
                year: "2025",
                is_published: true,
                file_size: 2048,
                file_url: "https://example.com/laporan-2025.pdf",
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        fetchCategoryDocuments.mockResolvedValue({
            documents: category.documents,
            total: 1,
            totalPages: 1,
            availableYears: ["2025"],
        });
    });

    it("renders category panel, upload panel, and document list", async () => {
        render(
            <AdminLaporanCategoryManager
                category={category}
                categories={categories}
            />,
        );

        expect(screen.getByText(/Pilih Kategori/i)).toBeInTheDocument();
        expect(screen.getByText(/Unggah Dokumen Baru|Upload Baru/i)).toBeInTheDocument();
        expect(screen.getByText(/Daftar Berkas|Arsip Dokumen/i)).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /pilih kategori/i }),
        ).toBeInTheDocument();

        expect(await screen.findByText("Laporan 2025")).toBeInTheDocument();
        expect(await screen.findByText("Deskripsi laporan 2025")).toBeInTheDocument();
    });

    it("shows upload button and category switch buttons", () => {
        render(
            <AdminLaporanCategoryManager
                category={category}
                categories={categories}
            />,
        );

        expect(
            screen.getByRole("button", { name: /simpan dokumen/i }),
        ).toBeInTheDocument();

        // Click the Pilih Kategori trigger to open the dropdown
        const trigger = screen.getByRole("button", { name: /pilih kategori/i });
        fireEvent.click(trigger);

        expect(
            screen.getAllByRole("button", { name: /sop dan standar pelayanan/i })[0],
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /laporan kinerja/i }),
        ).toBeInTheDocument();
    });
});