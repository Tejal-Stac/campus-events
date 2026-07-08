import os, re

src_dir = r'd:\campus-events\src'
results = []

RAW_AXIOS = re.compile(r"import axios from ['\"]axios['\"]")
LOCALHOST = re.compile(r"http://localhost:5000")
API_VAR = re.compile(r"const API\s*=")
MANUAL_HEADER = re.compile(r"Authorization.*Bearer")

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if not file.endswith(('.js', '.jsx')):
            continue
        path = os.path.join(root, file)
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        has_raw_axios = bool(RAW_AXIOS.search(content))
        has_localhost = bool(LOCALHOST.search(content))
        has_api_var = bool(API_VAR.search(content))
        has_manual_header = bool(MANUAL_HEADER.search(content))

        if has_raw_axios or has_localhost or has_api_var:
            rel = os.path.relpath(path, src_dir)
            results.append((rel, has_raw_axios, has_localhost, has_api_var, has_manual_header))

print("Files needing refactoring:")
for r in results:
    print(f"  {r[0]}")
    if r[1]: print("    [X] raw axios import")
    if r[2]: print("    [X] hardcoded localhost:5000")
    if r[3]: print("    [X] const API = ...")
    if r[4]: print("    [!] manual Authorization header")
print()
print("Total:", len(results))
