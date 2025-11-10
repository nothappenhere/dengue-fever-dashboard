import mongoose, { Document, Model } from 'mongoose';
import { IDengueCase } from '../types/index.js';

export interface IDengueCaseDocument extends IDengueCase, Document {}

export interface IDengueCaseModel extends Model<IDengueCaseDocument> {
  findByYear(year: number): Promise<IDengueCaseDocument[]>;
  findByRegency(regencyCode: string): Promise<IDengueCaseDocument[]>;
  calculateDerivedFieldsForDocs(docs: Partial<IDengueCase>[]): Partial<IDengueCase>[];
}

const dengueCaseSchema = new mongoose.Schema(
  {
    provinceCode: { type: String, required: true },
    provinceName: { type: String, required: true },
    regencyCode: { type: String, required: true },
    regencyName: { type: String, required: true },
    year: { type: Number, required: true },
    totalCases: { type: Number, required: true },
    maleDeaths: { type: Number, required: true },
    femaleDeaths: { type: Number, required: true },
    totalDeaths: { type: Number }, // akan dihitung otomatis
    caseFatalityRate: { type: Number }, // akan dihitung otomatis
  },
  {
    timestamps: true,
  }
);

// Compound index untuk performa query
dengueCaseSchema.index({ regencyCode: 1, year: 1 });
dengueCaseSchema.index({ provinceCode: 1, year: 1 });
dengueCaseSchema.index({ year: 1 });

// Middleware untuk menghitung totalDeaths dan caseFatalityRate sebelum save
dengueCaseSchema.pre<IDengueCaseDocument>("save", function (next) {
  this.totalDeaths = this.maleDeaths + this.femaleDeaths;
  this.caseFatalityRate =
    this.totalCases > 0
      ? parseFloat(((this.totalDeaths / this.totalCases) * 100).toFixed(2))
      : 0;
  next();
});

// Static method untuk mendapatkan data berdasarkan tahun
dengueCaseSchema.statics.findByYear = function (year: number) {
  return this.find({ year });
};

// Static method untuk mendapatkan data berdasarkan kabupaten/kota
dengueCaseSchema.statics.findByRegency = function (regencyCode: string) {
  return this.find({ regencyCode });
};

export const DengueCase: IDengueCaseModel = mongoose.model<IDengueCaseDocument, IDengueCaseModel>(
  'DengueCase', 
  dengueCaseSchema
);