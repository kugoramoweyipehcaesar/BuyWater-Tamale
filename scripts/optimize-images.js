const fs = require("fs");
const path = require("path");
function restore(name) {
  const a = path.join(__dirname, name + ".b64.a");
  const b = path.join(__dirname, name + ".b64.b");
  const single = path.join(__dirname, name + ".b64");
  let b64 = "";
  if (fs.existsSync(a) && fs.existsSync(b)) {
    b64 = fs.readFileSync(a, "utf8") + fs.readFileSync(b, "utf8");
  } else if (fs.existsSync(single)) {
    b64 = fs.readFileSync(single, "utf8");
  } else {
    console.warn("skip", name);
    return;
  }
  b64 = b64.replace(/\s+/g, "");
  const out = path.join(__dirname, "..", "public", name);
  fs.writeFileSync(out, Buffer.from(b64, "base64"));
  console.log("optimized", name, fs.statSync(out).size);
}
try { restore("logo.jpg"); } catch (e) { console.warn(e.message); }
try { restore("product.jpg"); } catch (e) { console.warn(e.message); }
