try {
  require("./img-logo");
  require("./img-product");
} catch (e) {
  console.warn("optimize-images skipped", e.message);
}
