import ProfessorLayout from "../../../components/ProfessorLayout";
import { RegistroInspecaoPagina } from "../../../components/InspecaoPagina";
import styles from "../../page.module.css";

export default function PaginaRegistroInspecao() {
  return (
    <ProfessorLayout titulo="Registro de inspeção">
      <div className={styles.pagina}>
        <RegistroInspecaoPagina />
      </div>
    </ProfessorLayout>
  );
}
