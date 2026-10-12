import { getPocketBase, getPocketBaseFileUrl } from "./pocketbase/client";

export async function fetchCategoryDocuments(slug, page = 1, limit = 10, year = "", q = "") {
  const pb = getPocketBase();
  const cleanSlug = slug.replace(/["\\]/g, "");
  const category = await pb.collection("report_categories").getFirstListItem(`slug = "${cleanSlug}"`);
  
  const filters = [`(category_id = "${category.id}" || category_id = "${category.original_id || ''}")`];
  if (year) {
    filters.push(`year = "${year}"`);
  }
  if (q && q.trim()) {
    const cleanQ = q.replace(/["\\]/g, "");
    filters.push(`(title ~ "${cleanQ}" || description ~ "${cleanQ}")`);
  }

  const res = await pb.collection("report_documents").getList(page, limit, {
    filter: filters.join(" && "),
    sort: "-year,sort_order",
  });

  const allDocs = await pb.collection("report_documents").getFullList({
    filter: `(category_id = "${category.id}" || category_id = "${category.original_id || ''}")`,
    fields: "year",
  }).catch(() => []);

  const years = Array.from(new Set(allDocs.map((d) => d.year).filter(Boolean))).sort().reverse();

  const documents = res.items.map((d) => {
    const fileField = d.document_file || d.file;
    const url = fileField ? getPocketBaseFileUrl(d, fileField) : (d.file_url || "");
    return {
      ...d,
      file_url: url,
      href: url,
    };
  });

  return {
    category,
    documents,
    totalDocuments: res.totalItems,
    page: res.page,
    totalPages: res.totalPages,
    years,
  };
}

export async function uploadLaporanDocument({
  files,
  categoryId,
  categorySlug,
  title,
  description,
  year,
  is_published,
}) {
  const pb = getPocketBase();
  const fileToUpload = Array.isArray(files) ? files[0] : files;

  const formData = new FormData();
  if (fileToUpload) {
    formData.append("file", fileToUpload);
  }
  formData.append("category_id", String(categoryId || ""));
  formData.append("title", String(title || "").trim());
  formData.append("description", String(description || "").trim());
  formData.append("year", String(year || ""));
  formData.append("is_published", String(Boolean(is_published)));

  const record = await pb.collection("report_documents").create(formData);
  return {
    message: "Dokumen berhasil diunggah",
    document: {
      ...record,
      file_url: record.file ? getPocketBaseFileUrl(record, record.file) : "",
    },
  };
}

export async function updateLaporanDocument(id, payload) {
  const pb = getPocketBase();
  const record = await pb.collection("report_documents").update(id, {
    title: String(payload?.title || "").trim(),
    description: String(payload?.description || "").trim(),
    year: String(payload?.year || ""),
    is_published: Boolean(payload?.is_published),
  });
  return {
    message: "Dokumen berhasil diperbarui",
    document: {
      ...record,
      file_url: record.file ? getPocketBaseFileUrl(record, record.file) : "",
    },
  };
}

export async function updateLaporanDocumentWithFile(id, payload) {
  const pb = getPocketBase();
  const formData = new FormData();
  formData.append("title", String(payload?.title || "").trim());
  formData.append("description", String(payload?.description || "").trim());
  formData.append("year", String(payload?.year || ""));
  formData.append("is_published", String(Boolean(payload?.is_published)));
  if (payload?.file) {
    formData.append("file", payload.file);
  }

  const record = await pb.collection("report_documents").update(id, formData);
  return {
    message: "Dokumen berhasil diperbarui",
    document: {
      ...record,
      file_url: record.file ? getPocketBaseFileUrl(record, record.file) : "",
    },
  };
}

export async function deleteLaporanDocument(id) {
  const pb = getPocketBase();
  await pb.collection("report_documents").delete(id);
  return { message: "Dokumen berhasil dihapus" };
}
