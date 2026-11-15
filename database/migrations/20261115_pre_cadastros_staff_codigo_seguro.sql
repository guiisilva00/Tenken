USE tenken_db;

DELIMITER //
CREATE PROCEDURE migrar_pre_cadastros_staff_codigo_seguro()
BEGIN
    DECLARE tem_coluna_tentativas INT DEFAULT 0;
    DECLARE tem_coluna_expira_em INT DEFAULT 0;

    SELECT COUNT(*) INTO tem_coluna_tentativas
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'pre_cadastros_staff'
      AND column_name = 'tentativas';
    IF tem_coluna_tentativas = 0 THEN
        ALTER TABLE pre_cadastros_staff
            ADD COLUMN tentativas TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER utilizada;
    END IF;

    SELECT COUNT(*) INTO tem_coluna_expira_em
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'pre_cadastros_staff'
      AND column_name = 'expira_em';
    IF tem_coluna_expira_em = 0 THEN
        ALTER TABLE pre_cadastros_staff ADD COLUMN expira_em DATETIME NULL AFTER tentativas;
        UPDATE pre_cadastros_staff
        SET expira_em = DATE_ADD(criado_em, INTERVAL 7 DAY)
        WHERE expira_em IS NULL;
        ALTER TABLE pre_cadastros_staff MODIFY COLUMN expira_em DATETIME NOT NULL;
    END IF;
END//
DELIMITER ;

CALL migrar_pre_cadastros_staff_codigo_seguro();
DROP PROCEDURE migrar_pre_cadastros_staff_codigo_seguro;
