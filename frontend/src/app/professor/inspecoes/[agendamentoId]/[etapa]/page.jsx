import ProfessorLayout from "../../../components/ProfessorLayout";
import { InspecaoPendentePagina } from "../../../components/InspecaoPagina";
import styles from "../../page.module.css";

export default function PaginaInspecaoPendente() {
  return (
    <ProfessorLayout titulo="Inspeção">
      <div className={styles.pagina}>
        <InspecaoPendentePagina />
      </div>
    </ProfessorLayout>
  );
}
