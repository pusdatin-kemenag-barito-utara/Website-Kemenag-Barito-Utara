import { getPocketBase, getPocketBaseFileUrl } from "./pocketbase/client";

function resolveLaporanFileUrl(record) {
  if (!record) return "";
  const fileField = record.document_file || record.file;
  return fileField ? getPocketBaseFileUrl(record, fileField) : (record.file_url || "");
}

function buildTitleFromFile(file) {
  return (
    String(file?.name || "Dokumen Laporan")
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "Dokumen Laporan"
  );
}

export async function fetchCategoryDocuments(slug, page = 1, limit = 10, year = "", q = "") {
  const pb = getPocketBase();
  const cleanSlug = String(slug || "").replace(/["\\]/g, "");
  const category = await pb.collection("report_categories").getFirstListItem(`slug = "${cleanSlug}"`);

  const categoryFilter = category.original_id
    ? `(category_id = "${category.id}" || category_id = "${category.original_id}")`
    : `category_id = "${category.id}"`;

  const filters = [categoryFilter];
  if (year) {
    const numYear = Number(year);
    filters.push(Number.isFinite(numYear) && numYear > 0 ? `year = ${numYear}` : `year = "${String(year).replace(/["\\]/g, "")}"`);
  }
  if (q && q.trim()) {
    const cleanQ = q.trim().replace(/["\\]/g, "");
    filters.push(`(title ~ "${cleanQ}" || description ~ "${cleanQ}" || file_name ~ "${cleanQ}")`);
  }

  const res = await pb.collection("report_documents").getList(page, limit, {
    filter: filters.join(" && "),
    sort: "-year,sort_order",
    requestKey: null,
  });

  const allDocs = await pb
    .collection("report_documents")
    .getFullList({
      filter: categoryFilter,
      fields: "year",
      requestKey: null,
    })
    .catch(() => []);

  const years = Array.from(new Set(allDocs.map((d) => d.year).filter(Boolean)))
    .map((y) => String(y))
    .sort()
    .reverse();

  const documents = res.items.map((d) => {
    const url = resolveLaporanFileUrl(d);
    return {
      ...d,
      file_url: url,
      href: url,
    };
  });

  return {
    category,
    documents,
    total: res.totalItems,
    totalDocuments: res.totalItems,
    page: res.page,
    totalPages: res.totalPages,
    availableYears: years,
    years,
  };
}

export async function uploadLaporanDocument({
  files,
  categoryId,
  title,
  description,
  year,
  is_published,
}) {
  const pb = getPocketBase();
  const fileList = Array.isArray(files) ? files.filter(Boolean) : files ? [files] : [];
  if (fileList.length === 0) {
    throw new Error("Pilih setidaknya satu file PDF untuk diunggah.");
  }

  const normalizedYear = Number(year) || new Date().getFullYear();
  const createdDocs = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const docTitle =
      fileList.length === 1 && String(title || "").trim()
        ? String(title).trim()
        : buildTitleFromFile(file);

    const formData = new FormData();
    formData.append("document_file", file);
    formData.append("category_id", String(categoryId || ""));
    formData.append("title", docTitle);
    formData.append("description", String(description || "").trim());
    formData.append("year", String(normalizedYear));
    formData.append("file_name", String(file.name || "dokumen.pdf"));
    formData.append("mime_type", String(file.type || "application/pdf"));
    formData.append("file_size", String(Number(file.size || 0)));
    formData.append("is_published", String(Boolean(is_published)));

    let record = await pb.collection("report_documents").create(formData);
    if (record?.document_file) {
      const publicUrl = getPocketBaseFileUrl(record, record.document_file);
      if (publicUrl && record.file_url !== publicUrl) {
        record = await pb.collection("report_documents").update(record.id, { file_url: publicUrl });
      }
    }

    const url = resolveLaporanFileUrl(record);
    createdDocs.push({
      ...record,
      file_url: url,
      href: url,
    });
  }

  return {
    message:
      createdDocs.length > 1
        ? `${createdDocs.length} dokumen berhasil diunggah.`
        : "Dokumen berhasil diunggah.",
    document: createdDocs[0],
    documents: createdDocs,
  };
}

export async function updateLaporanDocument(id, payload) {
  const pb = getPocketBase();
  const record = await pb.collection("report_documents").update(id, {
    title: String(payload?.title || "").trim(),
    description: String(payload?.description || "").trim(),
    year: Number(payload?.year) || new Date().getFullYear(),
    is_published: Boolean(payload?.is_published),
  });
  const url = resolveLaporanFileUrl(record);
  return {
    message: "Dokumen berhasil diperbarui",
    document: {
      ...record,
      file_url: url,
      href: url,
    },
  };
}

export async function updateLaporanDocumentWithFile(id, payload) {
  const pb = getPocketBase();
  const formData = new FormData();
  formData.append("title", String(payload?.title || "").trim());
  formData.append("description", String(payload?.description || "").trim());
  formData.append("year", String(Number(payload?.year) || new Date().getFullYear()));
  formData.append("is_published", String(Boolean(payload?.is_published)));

  if (payload?.file) {
    formData.append("document_file", payload.file);
    formData.append("file_name", String(payload.file.name || "dokumen.pdf"));
    formData.append("mime_type", String(payload.file.type || "application/pdf"));
    formData.append("file_size", String(Number(payload.file.size || 0)));
  }

  let record = await pb.collection("report_documents").update(id, formData);
  if (payload?.file && record?.document_file) {
    const publicUrl = getPocketBaseFileUrl(record, record.document_file);
    if (publicUrl && record.file_url !== publicUrl) {
      record = await pb.collection("report_documents").update(record.id, { file_url: publicUrl });
    }
  }

  const url = resolveLaporanFileUrl(record);
  return {
    message: "Dokumen berhasil diperbarui",
    document: {
      ...record,
      file_url: url,
      href: url,
    },
  };
}

export async function deleteLaporanDocument(id) {
  const pb = getPocketBase();
  await pb.collection("report_documents").delete(id);
  return { message: "Dokumen berhasil dihapus" };
}
