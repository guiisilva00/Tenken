-- Script de uso único para pré-cadastros pendentes com códigos antigos.
-- Primeiro revise o SELECT e anote nome/e-mail/perfil; só então execute o DELETE.
-- Nunca afeta pré-cadastros utilizados.

SELECT id, nome, email, perfil, codigo, utilizada, criado_em
FROM pre_cadastros_staff
WHERE utilizada = FALSE
  AND codigo REGEXP '^(PROF|TEC)-[0-9]{5}$'
  AND codigo NOT REGEXP '^(PROF|TEC)-[0-9A-Za-z]{8}$'
ORDER BY criado_em ASC;

-- Execute somente após revisar os resultados e registrar os dados para recriação.
DELETE FROM pre_cadastros_staff
WHERE utilizada = FALSE
  AND codigo REGEXP '^(PROF|TEC)-[0-9]{5}$'
  AND codigo NOT REGEXP '^(PROF|TEC)-[0-9A-Za-z]{8}$';
