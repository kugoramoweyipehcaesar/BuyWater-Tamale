const fs = require("fs");
const path = require("path");
function restore(name) {
  const b64path = path.join(__dirname, name + ".b64");
  if (!fs.existsSync(b64path)) {
    console.warn("skip", name);
    return;
  }
  const b64 = fs.readFileSync(b64path, "utf8").replace(/\s+/g, "");
  const out = path.join(__dirname, "..", "public", name);
  fs.writeFileSync(out, Buffer.from(b64, "base64"));
  console.log("optimized", name, fs.statSync(out).size);
}
try { restore("logo.jpg"); } catch (e) { console.warn(e.message); }
try { restore("product.jpg"); } catch (e) { console.warn(e.message); }
