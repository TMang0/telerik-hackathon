import { searchParam } from "../search/PatientSearch";
import { Language } from "./Language";
/**
 *  =========================================
 *      .MODEL QUEUE REQUEST FOR PATIENTS
 *  =========================================
 */
export default interface QueuePatient {
  token: string;
  peerid: string;
  param: searchParam;
  language: Language[];
}
