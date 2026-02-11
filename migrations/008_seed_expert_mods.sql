-- ========================================
-- 🌱 SEED - Données initiales des mods expert
-- ========================================

-- CPU Mods
INSERT INTO expert_mods (id, name, category, price, technical_specs, power_requirements, description, tooltip_content, dependencies)
VALUES 
(
    'MOD_CPU_OVERCLOCK_2X',
    'CPU Overclock 2x',
    'Cpu',
    25.0,
    '{"amplification": "2x", "impact_thermique": "Modéré"}'::jsonb,
    NULL,
    'Double la vitesse du processeur pour des performances accrues.',
    'Impact performances : Double la fréquence CPU. Processus installation : Remplacement du cristal oscillateur. Dépendances : Aucune. Avantages : Gains de FPS importants. Inconvénients : Consommation et chaleur accrues.',
    ARRAY[]::text[]
),
(
    'MOD_CPU_COOLING',
    'CPU Cooling Mod',
    'Cpu',
    15.0,
    '{"dissipation": "Améliorée", "température_reduite": "~15%"}'::jsonb,
    NULL,
    'Améliore la dissipation thermique du processeur.',
    'Impact performances : Réduit la température de ~15%. Processus installation : Pose de dissipateur thermique. Dépendances : Aucune. Avantages : Stabilité prolongée. Inconvénients : Nécessite espace.',
    ARRAY[]::text[]
);

-- Audio Mods
INSERT INTO expert_mods (id, name, category, price, technical_specs, power_requirements, description, tooltip_content, dependencies)
VALUES 
(
    'MOD_AUDIO_CLEANAMP_PRO',
    'CleanAmp Pro',
    'Audio',
    35.0,
    '{"amplification": "2x", "reduction_bruit": "Oui"}'::jsonb,
    '1700mAh',
    'Amplification audio 2x avec réduction du bruit de fond.',
    'Impact performances : Son amplifié 2x, bruit réduit. Processus installation : Remplacement du circuit audio. Dépendances : Nécessite batterie 1700mAh pour fonctionner. Avantages : Qualité audio exceptionnelle. Inconvénients : Consommation accrue.',
    ARRAY['MOD_POWER_BATTERY_1700MAH']::text[]
),
(
    'MOD_AUDIO_ENHANCEMENT_KIT',
    'Audio Enhancement Kit',
    'Audio',
    20.0,
    '{"qualite_sonore": "Améliorée"}'::jsonb,
    NULL,
    'Amélioration générale de la qualité sonore.',
    'Impact performances : Qualité sonore améliorée. Processus installation : Ajout de condensateurs audio. Dépendances : Aucune. Avantages : Son plus propre. Inconvénients : Aucun.',
    ARRAY[]::text[]
);

-- Power Mods
INSERT INTO expert_mods (id, name, category, price, technical_specs, power_requirements, description, tooltip_content, dependencies)
VALUES 
(
    'MOD_POWER_BATTERY_1700MAH',
    'Batterie Li-Po 1700mAh',
    'Power',
    18.0,
    '{"capacite": "1700mAh", "type": "Li-Po"}'::jsonb,
    NULL,
    'Batterie rechargeable haute capacité.',
    'Impact performances : Autonomie augmentée (~8h). Processus installation : Remplacement de la pile d''origine. Dépendances : Aucune. Avantages : Longue autonomie. Inconvénients : Nécessaire pour certains mods audio.',
    ARRAY[]::text[]
),
(
    'MOD_POWER_BATTERY_2000MAH',
    'Batterie Li-Po 2000mAh',
    'Power',
    22.0,
    '{"capacite": "2000mAh", "type": "Li-Po"}'::jsonb,
    NULL,
    'Batterie rechargeable très haute capacité.',
    'Impact performances : Autonomie maximale (~10h). Processus installation : Remplacement de la pile d''origine. Dépendances : Aucune. Avantages : Autonomie maximale. Inconvénients : Légèrement plus encombrante.',
    ARRAY[]::text[]
),
(
    'MOD_POWER_USBC_CHARGER',
    'Chargeur USB-C',
    'Power',
    12.0,
    '{"connecteur": "USB-C", "charge_rapide": "Non"}'::jsonb,
    NULL,
    'Chargeur moderne USB-C pour recharge rapide.',
    'Impact performances : Recharge moderne. Processus installation : Remplacement du port de charge. Dépendances : Aucune. Avantages : Compatible chargeurs modernes. Inconvénients : Nécessite modification de la coque.',
    ARRAY[]::text[]
);
