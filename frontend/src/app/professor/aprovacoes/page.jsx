import AprovacoesProfessor from "../components/AprovacoesProfessor";
import ProfessorLayout from "../components/ProfessorLayout";
import styles from "./page.module.css";

export default function PaginaAprovacoesProfessor() {
  return <ProfessorLayout titulo="Aprovações pendentes"><div className={styles.pagina}><AprovacoesProfessor /></div></ProfessorLayout>;
}
