

import importlib


file_path = "./migrations/8_newhookreference.py"
module_name = "migrate_script"
spec = importlib.util.spec_from_file_location(module_name, file_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

module.up_migration()