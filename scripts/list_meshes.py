import struct
import json
import sys

def list_meshes(glb_path):
    with open(glb_path, 'rb') as f:
        # Header: magic (4), version (4), length (4)
        magic = f.read(4)
        if magic != b'glTF':
            print("Not a glTF file")
            return
        
        version = struct.unpack('<I', f.read(4))[0]
        length = struct.unpack('<I', f.read(4))[0]
        
        # First Chunk: length (4), type (4), data
        chunk_length = struct.unpack('<I', f.read(4))[0]
        chunk_type = f.read(4)
        
        if chunk_type != b'JSON':
            print("First chunk is not JSON")
            return
            
        json_data = f.read(chunk_length).decode('utf-8')
        data = json.loads(json_data)
        
        if 'nodes' in data:
            for node in data['nodes']:
                if 'name' in node:
                    print(f"Node: {node['name']}")
        
        if 'meshes' in data:
            for mesh in data['meshes']:
                if 'name' in mesh:
                    print(f"Mesh: {mesh['name']}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python list_meshes.py <path_to_glb>")
    else:
        list_meshes(sys.argv[1])
