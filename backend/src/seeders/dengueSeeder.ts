import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { DengueCase } from "../models/DengueCase.js";

dotenv.config();

interface JsonData {
  type: string;
  name?: string;
  data?: any[];
}

interface ColumnMapping {
  id: string | null;
  provinceCode: string | null;
  provinceName: string | null;
  regencyCode: string | null;
  regencyName: string | null;
  year: string | null;
  totalCases: string | null;
  maleDeaths: string | null;
  femaleDeaths: string | null;
}

async function seedDengueData(): Promise<void> {
  try {
    // Koneksi ke MongoDB
    await connectDB();

    // Baca file JSON
    const rawData = fs.readFileSync(
      "./src/seeders/data/dengue_fever_dataset.json",
      "utf-8"
    );
    const parsed: JsonData[] = JSON.parse(rawData);

    // Cari tabel data dengue
    const dengueTable = parsed.find(
      (obj) => obj.type === "table" && obj.name === "dengue_fever_dataset"
    );

    if (!dengueTable) {
      throw new Error("Dengue fever dataset table not found in JSON file");
    }

    const dengueData = dengueTable.data;
    if (!dengueData) {
      console.error("Dengue data is undefined!");
      process.exit(1);
    }

    // Ambil header untuk mapping kolom
    const headers = dengueData[0];
    const columnMapping: ColumnMapping = {
      id: getColumnKey(headers, "id"),
      provinceCode: getColumnKey(headers, "kode_provinsi"),
      provinceName: getColumnKey(headers, "nama_provinsi"),
      regencyCode: getColumnKey(headers, "kode_kabupaten_kota"),
      regencyName: getColumnKey(headers, "nama_kabupaten_kota"),
      year: getColumnKey(headers, "tahun"),
      totalCases: getColumnKey(headers, "jumlah_kasus"),
      maleDeaths: getColumnKey(headers, "jumlah_kasus_meninggal_laki"),
      femaleDeaths: getColumnKey(headers, "jumlah_kasus_meninggal_perempuan"),
    };

    // Validasi mapping
    for (const [key, value] of Object.entries(columnMapping)) {
      if (value === null) {
        throw new Error(`Column mapping failed for ${key}`);
      }
    }

    const mapping = columnMapping as Record<keyof typeof columnMapping, string>;

    // Transform data (skip header row)
    const mappedData = dengueData!
      .slice(1)
      .map((item, index) => {
        if (
          !item[mapping.provinceCode] ||
          !item[mapping.regencyCode] ||
          !item[mapping.year]
        ) {
          console.warn(
            `Skipping row ${index + 1} due to missing required data:`,
            item
          );
          return null;
        }

        const totalCases = parseInt(item[mapping.totalCases]) || 0;
        const maleDeaths = parseInt(item[mapping.maleDeaths]) || 0;
        const femaleDeaths = parseInt(item[mapping.femaleDeaths]) || 0;
        const totalDeaths = maleDeaths + femaleDeaths;
        const caseFatalityRate =
          totalCases > 0
            ? parseFloat(((totalDeaths / totalCases) * 100).toFixed(2))
            : 0;

        return {
          provinceCode: item[mapping.provinceCode]?.toString().trim(),
          provinceName: item[mapping.provinceName]?.toString().trim(),
          regencyCode: item[mapping.regencyCode]?.toString().trim(),
          regencyName: item[mapping.regencyName]?.toString().trim(),
          year: parseInt(item[mapping.year]),
          totalCases: totalCases,
          maleDeaths: maleDeaths,
          femaleDeaths: femaleDeaths,
          totalDeaths: totalDeaths, // Manual calculation
          caseFatalityRate: caseFatalityRate, // Manual calculation
        };
      })
      .filter((item) => item !== null); // Hapus null entries

    console.log(`Processing ${mappedData.length} records...`);

    // Hapus data lama
    await DengueCase.deleteMany({});
    console.log("Old dengue data cleared!");

    // Insert data baru
    await DengueCase.insertMany(mappedData);
    console.log(
      `Successfully seeded ${mappedData.length} dengue case records!`
    );

    // Verifikasi data
    const totalRecords = await DengueCase.countDocuments();
    const uniqueYears = await DengueCase.distinct("year");
    const uniqueRegencies = await DengueCase.distinct("regencyCode");

    console.log(`Total records in database: ${totalRecords}`);
    console.log(`Years covered: ${uniqueYears.sort().join(", ")}`);
    console.log(`Number of regencies: ${uniqueRegencies.length}`);

    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error seeding dengue data:", errorMessage);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Helper function untuk mapping kolom
function getColumnKey(
  headers: Record<string, string>,
  columnName: string
): string | null {
  return (
    Object.entries(headers).find(([_, value]) => value === columnName)?.[0] ??
    null
  );
}

// Jalankan seeder jika file di-execute langsung
seedDengueData();
