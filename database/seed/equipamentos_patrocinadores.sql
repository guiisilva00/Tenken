-- Equipamentos adicionais inspirados em modelos reais dos parceiros do Tenken.
-- Inclui 25 robos industriais/colaborativos e 20 bancadas didaticas.
-- Requisito: database/init/02-schema.sql aplicado.
-- Reexecucao segura: os codigos de patrimonio sao unicos; registros existentes
-- com o mesmo codigo sao preservados sem alterar seus dados.

USE tenken_db;
SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO equipamentos
  (codigo_patrimonio, nome, tipo, localizacao, status)
VALUES
  -- Robos ABB
  ('TEN-LAB-ROB-101', 'ABB IRB 1200', 'ROBO', 'Laboratorio de Robotica — celula ABB 1', 'DISPONIVEL'),
  ('TEN-LAB-ROB-102', 'ABB IRB 2600', 'ROBO', 'Laboratorio de Robotica — celula ABB 2', 'DISPONIVEL'),
  ('TEN-LAB-ROB-103', 'ABB IRB 6700', 'ROBO', 'Laboratorio de Robotica — celula ABB 3', 'DISPONIVEL'),
  ('TEN-LAB-ROB-104', 'ABB IRB 14000 YuMi', 'ROBO', 'Laboratorio de Robotica — celula colaborativa 1', 'DISPONIVEL'),
  ('TEN-LAB-ROB-105', 'ABB CRB 15000 GoFa', 'ROBO', 'Laboratorio de Robotica — celula colaborativa 2', 'DISPONIVEL'),

  -- Robos FANUC
  ('TEN-LAB-ROB-106', 'FANUC LR Mate 200iD', 'ROBO', 'Laboratorio de Robotica — celula FANUC 1', 'DISPONIVEL'),
  ('TEN-LAB-ROB-107', 'FANUC CRX-10iA', 'ROBO', 'Laboratorio de Robotica — celula colaborativa 3', 'DISPONIVEL'),
  ('TEN-LAB-ROB-108', 'FANUC M-10iD', 'ROBO', 'Laboratorio de Robotica — celula FANUC 2', 'DISPONIVEL'),
  ('TEN-LAB-ROB-109', 'FANUC ARC Mate 100iD', 'ROBO', 'Laboratorio de Robotica — celula de soldagem 1', 'DISPONIVEL'),

  -- Robos KUKA
  ('TEN-LAB-ROB-110', 'KUKA KR 4 AGILUS', 'ROBO', 'Laboratorio de Robotica — celula KUKA 1', 'DISPONIVEL'),
  ('TEN-LAB-ROB-111', 'KUKA KR AGILUS', 'ROBO', 'Laboratorio de Robotica — celula KUKA 2', 'DISPONIVEL'),
  ('TEN-LAB-ROB-112', 'KUKA LBR iisy 3 R760', 'ROBO', 'Laboratorio de Robotica — celula colaborativa 4', 'DISPONIVEL'),
  ('TEN-LAB-ROB-113', 'KUKA KR IONTEC', 'ROBO', 'Laboratorio de Robotica — celula KUKA 3', 'DISPONIVEL'),

  -- Robos Mitsubishi Electric MELFA
  ('TEN-LAB-ROB-114', 'Mitsubishi Electric MELFA RV-2FR', 'ROBO', 'Laboratorio de Robotica — celula MELFA 1', 'DISPONIVEL'),
  ('TEN-LAB-ROB-115', 'Mitsubishi Electric MELFA RV-4FR', 'ROBO', 'Laboratorio de Robotica — celula MELFA 2', 'DISPONIVEL'),
  ('TEN-LAB-ROB-116', 'Mitsubishi Electric MELFA RV-7FR', 'ROBO', 'Laboratorio de Robotica — celula MELFA 3', 'DISPONIVEL'),
  ('TEN-LAB-ROB-117', 'Mitsubishi Electric MELFA RV-13FR', 'ROBO', 'Laboratorio de Robotica — celula MELFA 4', 'DISPONIVEL'),

  -- Robos Universal Robots
  ('TEN-LAB-ROB-118', 'Universal Robots UR3e', 'ROBO', 'Laboratorio de Robotica — celula UR 1', 'DISPONIVEL'),
  ('TEN-LAB-ROB-119', 'Universal Robots UR5e', 'ROBO', 'Laboratorio de Robotica — celula UR 2', 'DISPONIVEL'),
  ('TEN-LAB-ROB-120', 'Universal Robots UR10e', 'ROBO', 'Laboratorio de Robotica — celula UR 3', 'DISPONIVEL'),
  ('TEN-LAB-ROB-121', 'Universal Robots UR16e', 'ROBO', 'Laboratorio de Robotica — celula UR 4', 'DISPONIVEL'),

  -- Robos OMRON e Yaskawa
  ('TEN-LAB-ROB-122', 'OMRON TM5-700', 'ROBO', 'Laboratorio de Robotica — celula OMRON 1', 'DISPONIVEL'),
  ('TEN-LAB-ROB-123', 'OMRON TM12', 'ROBO', 'Laboratorio de Robotica — celula OMRON 2', 'DISPONIVEL'),
  ('TEN-LAB-ROB-124', 'Yaskawa MOTOMAN GP7', 'ROBO', 'Laboratorio de Robotica — celula Yaskawa 1', 'DISPONIVEL'),
  ('TEN-LAB-ROB-125', 'Yaskawa MOTOMAN GP8', 'ROBO', 'Laboratorio de Robotica — celula Yaskawa 2', 'DISPONIVEL'),

  -- Bancadas de automacao e controle
  ('TEN-LAB-BAN-101', 'Bancada Siemens SIMATIC S7-1200 CPU 1214C', 'BANCADA', 'Laboratorio de Automacao — bancada 8', 'DISPONIVEL'),
  ('TEN-LAB-BAN-102', 'Bancada Siemens SIMATIC S7-1500 CPU 1511-1 PN', 'BANCADA', 'Laboratorio de Automacao — bancada 9', 'DISPONIVEL'),
  ('TEN-LAB-BAN-103', 'Bancada Siemens LOGO! 8.4', 'BANCADA', 'Laboratorio de Automacao — bancada 10', 'DISPONIVEL'),
  ('TEN-LAB-BAN-104', 'Bancada Siemens SINAMICS G120C', 'BANCADA', 'Laboratorio de Automacao — bancada 11', 'DISPONIVEL'),
  ('TEN-LAB-BAN-105', 'Bancada Schneider Electric Modicon M221', 'BANCADA', 'Laboratorio de Automacao — bancada 12', 'DISPONIVEL'),
  ('TEN-LAB-BAN-106', 'Bancada Schneider Electric Modicon M241', 'BANCADA', 'Laboratorio de Automacao — bancada 13', 'DISPONIVEL'),
  ('TEN-LAB-BAN-107', 'Bancada Schneider Electric Altivar Machine ATV320', 'BANCADA', 'Laboratorio de Acionamentos — bancada 1', 'DISPONIVEL'),
  ('TEN-LAB-BAN-108', 'Bancada Schneider Electric Lexium 32', 'BANCADA', 'Laboratorio de Acionamentos — bancada 2', 'DISPONIVEL'),
  ('TEN-LAB-BAN-109', 'Bancada WEG CLIC02 e CFW300', 'BANCADA', 'Laboratorio de Automacao — bancada 14', 'DISPONIVEL'),
  ('TEN-LAB-BAN-110', 'Bancada WEG CFW500 e motor W22', 'BANCADA', 'Laboratorio de Acionamentos — bancada 3', 'DISPONIVEL'),
  ('TEN-LAB-BAN-111', 'Bancada WEG CFW11 e motor W22', 'BANCADA', 'Laboratorio de Acionamentos — bancada 4', 'DISPONIVEL'),
  ('TEN-LAB-BAN-112', 'Bancada ABB AC500-eCo PM554-TP', 'BANCADA', 'Laboratorio de Automacao — bancada 15', 'DISPONIVEL'),
  ('TEN-LAB-BAN-113', 'Bancada ABB ACS380', 'BANCADA', 'Laboratorio de Acionamentos — bancada 5', 'DISPONIVEL'),
  ('TEN-LAB-BAN-114', 'Bancada Mitsubishi Electric MELSEC iQ-F FX5U', 'BANCADA', 'Laboratorio de Automacao — bancada 16', 'DISPONIVEL'),
  ('TEN-LAB-BAN-115', 'Bancada Mitsubishi Electric FR-E800', 'BANCADA', 'Laboratorio de Acionamentos — bancada 6', 'DISPONIVEL'),
  ('TEN-LAB-BAN-116', 'Bancada OMRON CP2E e IHM NB', 'BANCADA', 'Laboratorio de Automacao — bancada 17', 'DISPONIVEL'),
  ('TEN-LAB-BAN-117', 'Bancada OMRON NX1P2 e IHM NA5', 'BANCADA', 'Laboratorio de Automacao — bancada 18', 'DISPONIVEL'),
  ('TEN-LAB-BAN-118', 'Bancada FANUC R-30iB Mate e LR Mate', 'BANCADA', 'Laboratorio de Robotica — bancada de integracao 1', 'DISPONIVEL'),
  ('TEN-LAB-BAN-119', 'Bancada KUKA KR C5 micro e KR AGILUS', 'BANCADA', 'Laboratorio de Robotica — bancada de integracao 2', 'DISPONIVEL'),
  ('TEN-LAB-BAN-120', 'Bancada Yaskawa MPiec e MOTOMAN GP7', 'BANCADA', 'Laboratorio de Robotica — bancada de integracao 3', 'DISPONIVEL')
ON DUPLICATE KEY UPDATE
  codigo_patrimonio = VALUES(codigo_patrimonio);

COMMIT;

-- Quantidade carregada por categoria para conferencia.
SELECT tipo, COUNT(*) AS total
FROM equipamentos
WHERE codigo_patrimonio BETWEEN 'TEN-LAB-ROB-101' AND 'TEN-LAB-ROB-125'
   OR codigo_patrimonio BETWEEN 'TEN-LAB-BAN-101' AND 'TEN-LAB-BAN-120'
GROUP BY tipo
ORDER BY tipo;
