import {
  ICompany,
  ICreateCompany,
  ECompanyStatus,
} from "@/shared/types/company-types";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { ICompanyRepository } from "../repository/company-repository";
import { db } from "@/config/firebase";

export class CompanyServices implements ICompanyRepository {
  constructor() {}

  getAllCompaniesOnSnapshot(
    callback: (companies: ICompany[]) => void
  ): () => void {
    const unsubscribe = onSnapshot(
      collection(db, "Companies"),
      (snapshot) => {
        const companies: ICompany[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ICompany[];
        callback(companies);
      },
      (error) => {
        console.error("Error en tiempo real obteniendo empresas:", error);
      }
    );
    return unsubscribe;
  }

  async createCompany(company: ICreateCompany): Promise<void> {
    try {
      const newCompany = {
        ...company,
        status: ECompanyStatus.active,
        creationDate: Timestamp.now(),
      };

      await addDoc(collection(db, "Companies"), newCompany);
      console.log("Empresa creada correctamente");
    } catch (error) {
      console.error("Error creando empresa:", error);
      throw new Error(`Error creando empresa: ${error}`);
    }
  }

  async updateCompany(id: string, company: Partial<ICompany>): Promise<void> {
    try {
      const companyRef = doc(db, "Companies", id);
      await updateDoc(companyRef, company);
      console.log(`Empresa ${id} actualizada correctamente`);
    } catch (error) {
      console.error("Error actualizando empresa:", error);
      throw new Error(`Error actualizando empresa: ${error}`);
    }
  }

  async deleteCompany(id: string): Promise<void> {
    try {
      const companyRef = doc(db, "Companies", id);
      await deleteDoc(companyRef);
      console.log(`Empresa ${id} eliminada correctamente`);
    } catch (error) {
      console.error("Error eliminando empresa:", error);
      throw new Error(`Error eliminando empresa: ${error}`);
    }
  }

  async updateCompanyStatus(id: string, status: boolean): Promise<void> {
    try {
      const companyRef = doc(db, "Companies", id);
      await updateDoc(companyRef, {
        status: status ? ECompanyStatus.active : ECompanyStatus.inactive,
      });
      console.log(`Estado de empresa ${id} actualizado correctamente`);
    } catch (error) {
      console.error("Error actualizando estado de empresa:", error);
      throw new Error(`Error actualizando estado de empresa: ${error}`);
    }
  }
}
