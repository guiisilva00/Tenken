import ChamadosProfessor from "../components/ChamadosProfessor";
import ProfessorLayout from "../components/ProfessorLayout";
import styles from "./page.module.css";

export default function PaginaChamadosProfessor() {
  return (
    <ProfessorLayout titulo="Chamados">
      <div className={styles.pagina}>
        <ChamadosProfessor />
      </div>
    </ProfessorLayout>
  );
}
