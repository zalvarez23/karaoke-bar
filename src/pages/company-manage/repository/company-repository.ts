import { ICompany, ICreateCompany } from "@/shared/types/company-types";

export interface ICompanyRepository {
  getAllCompaniesOnSnapshot(
    callback: (companies: ICompany[]) => void
  ): () => void;
  createCompany(company: ICreateCompany): Promise<void>;
  updateCompany(id: string, company: Partial<ICompany>): Promise<void>;
  deleteCompany(id: string): Promise<void>;
  updateCompanyStatus(id: string, status: boolean): Promise<void>;
}
