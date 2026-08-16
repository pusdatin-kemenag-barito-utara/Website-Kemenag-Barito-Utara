"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { siteInfo as defaultSiteInfo, siteLinks as defaultSiteLinks } from "@/data/site";

const SettingsContext = createContext({
  siteInfo: defaultSiteInfo,
  siteLinks: defaultSiteLinks,
});

export function SettingsProvider({ children, initialSettings }) {
  const [dbSettings, setDbSettings] = useState(initialSettings || null);

  useEffect(() => {
    // Background fetch latest public settings from Go Backend
    let isMounted = true;
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && typeof data === "object") {
          setDbSettings(data);
        }
      })
      .catch(() => {});

    const handleSettingsUpdated = (e) => {
      if (e.detail && typeof e.detail === "object") {
        setDbSettings(e.detail);
      }
    };
    window.addEventListener("settings-updated", handleSettingsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("settings-updated", handleSettingsUpdated);
    };
  }, []);

  const settings = useMemo(() => {
    const s = dbSettings || initialSettings || {};

    // Merge DB settings into the static siteInfo
    const mergedInfo = { ...defaultSiteInfo };

    if (s.nama_kantor) {
      mergedInfo.name = s.nama_kantor;
    }
    if (s.alamat) {
      mergedInfo.address = s.alamat;
      mergedInfo.region = s.alamat;
    }
    if (s.email) {
      mergedInfo.email = s.email;
    }
    if (s.telepon) {
      mergedInfo.phone = s.telepon;
      mergedInfo.phoneRaw = s.telepon.replace(/\D/g, "");
    }
    if (s.whatsapp) {
      mergedInfo.whatsapp = s.whatsapp;
      mergedInfo.whatsappRaw = s.whatsapp.replace(/\D/g, "");
    }

    // Build structured office hours
    const officeHours = [];
    if (s.jam_layanan_senin && s.jam_layanan_kamis && s.jam_layanan_senin === s.jam_layanan_kamis) {
      officeHours.push(`Senin - Kamis: ${s.jam_layanan_senin}`);
      if (s.jam_layanan_jumat) {
        officeHours.push(`Jum'at: ${s.jam_layanan_jumat}`);
      }
    } else {
      if (s.jam_layanan_senin) officeHours.push(`Senin: ${s.jam_layanan_senin}`);
      if (s.jam_layanan_selasa) officeHours.push(`Selasa: ${s.jam_layanan_selasa}`);
      if (s.jam_layanan_rabu) officeHours.push(`Rabu: ${s.jam_layanan_rabu}`);
      if (s.jam_layanan_kamis) officeHours.push(`Kamis: ${s.jam_layanan_kamis}`);
      if (s.jam_layanan_jumat) officeHours.push(`Jum'at: ${s.jam_layanan_jumat}`);
    }

    if (officeHours.length > 0) {
      mergedInfo.officeHours = officeHours;
      mergedInfo.officeHoursSummary = officeHours.join(" | ");
    } else if (s.jam_layanan) {
      mergedInfo.officeHours = [s.jam_layanan];
      mergedInfo.officeHoursSummary = s.jam_layanan;
    }

    // Security Settings
    mergedInfo.fitur_anti_copas = Boolean(s.fitur_anti_copas);

    // Merge Links
    const mergedLinks = { ...defaultSiteLinks };
    mergedLinks.emailHref = `mailto:${mergedInfo.email}`;
    mergedLinks.phoneHref = `tel:${mergedInfo.phoneRaw}`;
    mergedLinks.whatsappHref = `https://wa.me/${mergedInfo.whatsappRaw}?text=${encodeURIComponent(
      "Assalamu’alaikum, saya ingin menanyakan informasi layanan di Kemenag Barito Utara."
    )}`;

    if (s.instagram) mergedLinks.instagram = s.instagram;
    if (s.facebook) mergedLinks.facebook = s.facebook;
    if (s.youtube) mergedLinks.youtube = s.youtube;
    if (s.tiktok) mergedLinks.tiktok = s.tiktok;

    return {
      siteInfo: mergedInfo,
      siteLinks: mergedLinks,
    };
  }, [dbSettings, initialSettings]);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SettingsContext);
}
