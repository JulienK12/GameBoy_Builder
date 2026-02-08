
import csv
import os

def update_csv(file_path, images_dir, asset_prefix):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    # Map variant ID to its image file
    image_map = {}
    if os.path.exists(images_dir):
        for filename in os.listdir(images_dir):
            base_name = os.path.splitext(filename)[0]
            image_map[base_name] = filename

    updated_rows = []
    
    with open(file_path, mode='r', encoding='utf-8') as f:
        # Check first line for delimiter and potential quotes
        first_line = f.readline()
        f.seek(0)
        
        delimiter = ';'
        if ',' in first_line and ';' not in first_line:
            delimiter = ','
            
        reader = csv.DictReader(f, delimiter=delimiter)
        # Clean current fieldnames
        raw_fieldnames = reader.fieldnames
        clean_fieldnames = [fn.strip('"').strip('\ufeff') for fn in raw_fieldnames]

        for row in reader:
            # Create a clean row mapping
            new_row = {}
            for i, (fn, val) in enumerate(row.items()):
                clean_fn = clean_fieldnames[i]
                new_row[clean_fn] = val.strip('"') if val else ""
            
            variant_id = new_row.get('Variant_ID', '')
            if variant_id in image_map:
                new_row['Image_URL'] = f"{asset_prefix}/{image_map[variant_id]}"
            
            updated_rows.append(new_row)

    with open(file_path, mode='w', encoding='utf-8', newline='') as f:
        # Write without quotes for simplicity if they weren't strictly needed
        writer = csv.DictWriter(f, fieldnames=clean_fieldnames, delimiter=delimiter)
        writer.writeheader()
        writer.writerows(updated_rows)
    print(f"Updated {file_path}")

# Paths
base_data = r"c:\Users\Julien\OneDrive\Rayboy\dev\gameboy_builder\data"
base_assets = r"c:\Users\Julien\OneDrive\Rayboy\dev\gameboy_builder\assets\images"

update_csv(os.path.join(base_data, "Shell_Variants.csv"), os.path.join(base_assets, "shells"), "/assets/images/shells")
update_csv(os.path.join(base_data, "Screen_Variants.csv"), os.path.join(base_assets, "screens"), "/assets/images/screens")
update_csv(os.path.join(base_data, "Lens_Variants.csv"), os.path.join(base_assets, "lenses"), "/assets/images/lenses")
