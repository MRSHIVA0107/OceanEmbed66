with open('web/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace in loadARGOFleet
target_str = 'res = await fetch("/api/argo/matchups");'
replacement = 'res = await fetch("/api/argo_matchups.json");'

if target_str in js:
    js = js.replace(target_str, replacement)
    print("Replaced argo fetch target!")
else:
    print("target_str not found!")

# Also replace in loadMetadata
target_meta = 'res = await fetch("/api/metadata");'
replacement_meta = 'res = await fetch("/api/metadata.json");'
if target_meta in js:
    js = js.replace(target_meta, replacement_meta)
    print("Replaced metadata fetch target!")

with open('web/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("web/app.js saved!")
