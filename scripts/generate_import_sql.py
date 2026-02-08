
import csv
import os

def clean_val(val):
    if val is None: return ""
    return val.strip().strip('"').replace("'", "''")

def clean_row(row):
    return {k.strip('"').strip('\ufeff'): v for k, v in row.items()}

def map_mold(m):
    m = m.lower()
    if 'oem' in m: return 'OemStandard'
    if 'laminate' in m: return 'LaminatedReady'
    if 'ips' in m: return 'IpsReady'
    return 'OemStandard'

def map_brand(b):
    b = b.replace(" ", "")
    if b == 'CloudGameStore': return 'CloudGameStore'
    if b == 'FunnyPlaying': return 'FunnyPlaying'
    if b == 'Hispeedido': return 'Hispeedido'
    if b == 'ExtremeRate': return 'ExtremeRate'
    if b == 'OEM': return 'OEM'
    return 'OEM'

base_data = r"c:\Users\Julien\OneDrive\Rayboy\dev\gameboy_builder\data"
sql_file = r"c:\Users\Julien\OneDrive\Rayboy\dev\gameboy_builder\scripts\import_data.sql"

with open(sql_file, 'w', encoding='utf-8') as f:
    f.write("-- Automated Data Import\n")
    f.write("BEGIN;\n")
    f.write("TRUNCATE shell_screen_compatibility, lens_variants, screen_variants, shell_variants, lenses, screens, shells RESTART IDENTITY CASCADE;\n\n")

    # 1. SHELLS
    with open(os.path.join(base_data, "Shell_List.csv"), 'r', encoding='utf-8') as csvf:
        reader = csv.DictReader(csvf, delimiter=';')
        for row in reader:
            r = clean_row(row)
            f.write(f"INSERT INTO shells (id, handled_model, brand, name, price, mold) VALUES ('{r['ID']}', '{r['Handled Model']}', '{map_brand(r['Brand'])}', '{clean_val(r['Model Designation'])}', {r['Price']}, '{map_mold(r['Mold'])}');\n")
    
    # 2. SHELL VARIANTS
    with open(os.path.join(base_data, "Shell_Variants.csv"), 'r', encoding='utf-8') as csvf:
        reader = csv.DictReader(csvf, delimiter=';')
        for row in reader:
            r = clean_row(row)
            f.write(f"INSERT INTO shell_variants (id, shell_id, name, supplement, color_hex, image_url) VALUES ('{r['Variant_ID']}', '{r['Shell_ID']}', '{clean_val(r['Name'])}', {r['Supplement']}, '{r['Color_Hex']}', '{r['Image_URL']}');\n")

    # 3. SCREENS
    with open(os.path.join(base_data, "Screen_List.csv"), 'r', encoding='utf-8') as csvf:
        reader = csv.DictReader(csvf, delimiter=';')
        for row in reader:
            r = clean_row(row)
            f.write(f"INSERT INTO screens (id, handled_model, brand, name, price, size, assembly) VALUES ('{r['ID']}', '{r['Handled Model']}', '{map_brand(r['Brand'])}', '{clean_val(r['Model Designation'])}', {r['Price']}, '{r['Screen Size Category']}', '{r['Assembly']}');\n")

    # 4. SCREEN VARIANTS
    with open(os.path.join(base_data, "Screen_Variants.csv"), 'r', encoding='utf-8') as csvf:
        reader = csv.DictReader(csvf, delimiter=';')
        for row in reader:
            r = clean_row(row)
            f.write(f"INSERT INTO screen_variants (id, screen_id, name, supplement, image_url) VALUES ('{r['Variant_ID']}', '{r['Screen_ID']}', '{clean_val(r['Name'])}', {r['Supplement']}, '{r['Image_URL']}');\n")

    # 5. LENSES
    with open(os.path.join(base_data, "Lens_List.csv"), 'r', encoding='utf-8') as csvf:
        reader = csv.DictReader(csvf, delimiter=';')
        for row in reader:
            r = clean_row(row)
            f.write(f"INSERT INTO lenses (id, name, price, size) VALUES ('{r['ID']}', '{clean_val(r['Name'])}', {r['Price']}, '{r['Size']}');\n")

    # 6. LENS VARIANTS
    with open(os.path.join(base_data, "Lens_Variants.csv"), 'r', encoding='utf-8') as csvf:
        reader = csv.DictReader(csvf, delimiter=';')
        for row in reader:
            r = clean_row(row)
            f.write(f"INSERT INTO lens_variants (id, lens_id, name, supplement, image_url) VALUES ('{r['Variant_ID']}', '{r['Lens_ID']}', '{clean_val(r['Name'])}', {r['Supplement']}, '{r['Image_URL']}');\n")

    # 7. COMPATIBILITY
    with open(os.path.join(base_data, "Shell_Screen_Matrix.csv"), 'r', encoding='utf-8') as csvf:
        reader = csv.DictReader(csvf, delimiter=';')
        raw_fieldnames = reader.fieldnames
        clean_fieldnames = [fn.strip('"').strip('\ufeff') for fn in raw_fieldnames]
        shell_ids = clean_fieldnames[1:] 
        for row in reader:
            r = clean_row(row)
            screen_id = r['Compatibility']
            for s_id in shell_ids:
                status = r[s_id]
                f.write(f"INSERT INTO shell_screen_compatibility (screen_id, shell_id, status) VALUES ('{screen_id}', '{s_id}', '{status}');\n")

    f.write("COMMIT;\n")

print(f"Generated {sql_file}")
